"""
High-Speed HTTP Scraper with TLS Fingerprint Impersonation & BeautifulSoup Parsing.
Replaces third-party ScraperAPI proxies with direct local TLS-mimicking HTTP sessions.
"""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from dataclasses import asdict, dataclass, field
from typing import Any, Dict, List, Optional
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
from curl_cffi import requests

# Configure logging to stderr
logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("FastScraper")



CHROME_120_HEADERS: Dict[str, str] = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,"
        "image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Sec-CH-UA": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
}


@dataclass
class ScrapedProduct:
    """Structured data container for scraped product information."""
    url: str
    status_code: int
    title: Optional[str] = None
    price: Optional[float] = None
    original_price_text: Optional[str] = None
    currency: str = "INR"
    availability: Optional[str] = "In Stock"
    rating: Optional[float] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    brand: Optional[str] = None
    marketplace: Optional[str] = None
    extra_attributes: Dict[str, Any] = field(default_factory=dict)
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    def to_json(self, indent: int = 2) -> str:
        return json.dumps(self.to_dict(), indent=indent, ensure_ascii=False)


class FastScraper:
    """
    High-Speed HTTP Scraper utilizing curl-cffi to impersonate Chrome TLS fingerprints (JA3/JA4/HTTP2)
    and BeautifulSoup to extract structured data.
    """

    def __init__(
        self,
        impersonate: str = "chrome120",
        custom_headers: Optional[Dict[str, str]] = None,
        timeout: int = 20,
    ) -> None:
        self.impersonate = impersonate
        self.timeout = timeout
        self.headers = dict(CHROME_120_HEADERS)
        if custom_headers:
            self.headers.update(custom_headers)
        
        self.session = requests.Session(impersonate=self.impersonate)
        self.session.headers.update(self.headers)
        logger.debug("Initialized FastScraper session with impersonate='%s'", impersonate)

    def fetch(
        self,
        url: str,
        method: str = "GET",
        params: Optional[Dict[str, Any]] = None,
        data: Optional[Any] = None,
        headers: Optional[Dict[str, str]] = None,
        timeout: Optional[int] = None,
        allow_redirects: bool = True,
    ) -> requests.Response:
        """
        Executes a TLS-fingerprinted HTTP request.
        """
        req_headers = dict(self.headers)
        if headers:
            req_headers.update(headers)

        req_timeout = timeout or self.timeout
        logger.info("Fetching [%s] URL: %s", method, url)

        response = self.session.request(
            method=method,
            url=url,
            params=params,
            data=data,
            headers=req_headers,
            timeout=req_timeout,
            allow_redirects=allow_redirects,
        )
        logger.info("Response received: %s (%d bytes)", response.status_code, len(response.content))
        return response

    @staticmethod
    def parse_html(html_content: str | bytes, parser: str = "lxml") -> BeautifulSoup:
        """
        Parses raw HTML content into a BeautifulSoup document tree.
        """
        try:
            return BeautifulSoup(html_content, parser)
        except Exception:
            return BeautifulSoup(html_content, "html.parser")

    def extract_product(
        self,
        url: str,
        custom_selectors: Optional[Dict[str, str]] = None,
    ) -> ScrapedProduct:
        """
        Fetches and extracts structured product information (title, price, currency,
        availability, rating, image) using OpenGraph, Schema.org Microdata, and common e-commerce selectors.
        """
        parsed_url = urlparse(url)
        marketplace = parsed_url.netloc.replace("www.", "").split(".")[0].capitalize()

        try:
            response = self.fetch(url)
            if response.status_code >= 400:
                return ScrapedProduct(
                    url=url,
                    status_code=response.status_code,
                    marketplace=marketplace,
                    error=f"HTTP Error {response.status_code}",
                )

            soup = self.parse_html(response.text)
            product = self._parse_soup_product(soup, url, marketplace, response.status_code, custom_selectors)
            return product

        except Exception as e:
            logger.error("Scraping failed for %s: %s", url, str(e), exc_info=True)
            return ScrapedProduct(
                url=url,
                status_code=0,
                marketplace=marketplace,
                error=str(e),
            )

    def _parse_soup_product(
        self,
        soup: BeautifulSoup,
        url: str,
        marketplace: str,
        status_code: int,
        custom_selectors: Optional[Dict[str, str]] = None,
    ) -> ScrapedProduct:
        """
        Extracts product fields from parsed BeautifulSoup DOM.
        """
        # 1. Title Extraction
        title = None
        if custom_selectors and "title" in custom_selectors:
            el = soup.select_one(custom_selectors["title"])
            if el:
                title = el.get_text(strip=True)

        if not title:
            # Common Title Selectors - prioritize on-page heading tags
            title_candidates = [
                soup.select_one("#productTitle"),
                soup.select_one(".product_main h1"),
                soup.select_one("h1.B_NuCI"),  # Flipkart
                soup.select_one(".product-title"),
                soup.find("meta", property="og:title"),
                soup.find("meta", property="twitter:title"),
                soup.select_one("h1"),
                soup.find("title"),
            ]
            for candidate in title_candidates:
                if candidate:
                    text = candidate.get("content") if candidate.name == "meta" else candidate.get_text()
                    if text and text.strip():
                        title = text.strip()
                        # Clean up common title suffixes like " | Amazon.in" or " | Flipkart"
                        title = re.sub(r"\s*[-|]\s*(Amazon|Flipkart|GeM|IndiaMART|eBay).*$", "", title, flags=re.I).strip()
                        break


        # 2. Price Extraction
        price_num: Optional[float] = None
        price_text: Optional[str] = None
        currency: str = "INR"

        if custom_selectors and "price" in custom_selectors:
            el = soup.select_one(custom_selectors["price"])
            if el:
                price_text = el.get_text(strip=True)

        if not price_text:
            # OpenGraph / Meta price
            meta_price = soup.find("meta", property="product:price:amount") or soup.find("meta", itemprop="price")
            if meta_price and meta_price.get("content"):
                price_text = meta_price.get("content", "").strip()

        if not price_text:
            # Common DOM price selectors
            price_candidates = [
                soup.select_one(".price_color"),  # books.toscrape.com
                soup.select_one(".a-price .a-offscreen"),  # Amazon
                soup.select_one("#priceblock_ourprice"),
                soup.select_one("#priceblock_dealprice"),
                soup.select_one(".Nx9bqj.CxhGGd"),  # Flipkart main price
                soup.select_one(".product-price"),
                soup.select_one(".price"),
                soup.select_one('[data-test="product-price"]'),
            ]
            for candidate in price_candidates:
                if candidate:
                    val = candidate.get_text(strip=True)
                    if val and any(char.isdigit() for char in val):
                        price_text = val
                        break

        if price_text:
            # Infer currency
            if "₹" in price_text or "Rs" in price_text or "INR" in price_text:
                currency = "INR"
            elif "$" in price_text or "USD" in price_text:
                currency = "USD"
            elif "£" in price_text or "GBP" in price_text:
                currency = "GBP"
            elif "€" in price_text or "EUR" in price_text:
                currency = "EUR"

            # Parse numeric price value
            clean_price_match = re.search(r"[\d,]+(?:\.\d+)?", price_text)
            if clean_price_match:
                try:
                    raw_numeric_str = clean_price_match.group(0).replace(",", "")
                    price_num = float(raw_numeric_str)
                except ValueError:
                    price_num = None

        # 3. Availability
        availability = "In Stock"
        avail_el = (
            soup.find("meta", property="product:availability")
            or soup.find("meta", itemprop="availability")
            or soup.select_one(".availability")
            or soup.select_one("#availability")
            or soup.select_one(".instock")
        )
        if avail_el:
            avail_text = (avail_el.get("content") if avail_el.name == "meta" else avail_el.get_text()).strip()
            if re.search(r"out of stock|unavailable|sold out", avail_text, re.I):
                availability = "Out of Stock"
            elif re.search(r"in stock|available", avail_text, re.I):
                availability = "In Stock"
            else:
                availability = avail_text

        # 4. Rating
        rating = None
        rating_meta = soup.find("meta", itemprop="ratingValue")
        if rating_meta and rating_meta.get("content"):
            try:
                rating = float(rating_meta.get("content"))
            except ValueError:
                pass
        
        if rating is None:
            # Check class names like "star-rating Three"
            star_el = soup.select_one(".star-rating")
            if star_el:
                classes = star_el.get("class", [])
                word_to_num = {"one": 1.0, "two": 2.0, "three": 3.0, "four": 4.0, "five": 5.0}
                for c in classes:
                    if c.lower() in word_to_num:
                        rating = word_to_num[c.lower()]
                        break

        # 5. Image URL
        image_url = None
        img_meta = soup.find("meta", property="og:image") or soup.find("meta", itemprop="image")
        if img_meta and img_meta.get("content"):
            image_url = urljoin(url, img_meta.get("content"))
        if not image_url:
            img_el = soup.select_one("#landingImage") or soup.select_one(".item.active img") or soup.select_one(".thumbnail img")
            if img_el and img_el.get("src"):
                image_url = urljoin(url, img_el.get("src"))

        # 6. Description
        description = None
        desc_meta = soup.find("meta", property="og:description") or soup.find("meta", attrs={"name": "description"})
        if desc_meta and desc_meta.get("content"):
            description = desc_meta.get("content").strip()

        return ScrapedProduct(
            url=url,
            status_code=status_code,
            title=title,
            price=price_num,
            original_price_text=price_text,
            currency=currency,
            availability=availability,
            rating=rating,
            description=description,
            image_url=image_url,
            marketplace=marketplace,
        )

    def close(self) -> None:
        """Closes the underlying requests session."""
        self.session.close()


def scrape_product_url(url: str, impersonate: str = "chrome120") -> ScrapedProduct:
    """Helper function to quickly scrape a product URL."""
    scraper = FastScraper(impersonate=impersonate)
    try:
        return scraper.extract_product(url)
    finally:
        scraper.close()


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fast TLS-impersonating HTTP scraper and HTML extractor for e-commerce products."
    )
    parser.add_argument("url", help="Target URL to scrape")
    parser.add_argument("--impersonate", default="chrome120", help="Browser TLS fingerprint to impersonate (default: chrome120)")
    parser.add_argument("--json", action="store_true", help="Output results as JSON to stdout")
    parser.add_argument("--verbose", action="store_true", help="Enable verbose debug logging")

    args = parser.parse_args()

    if args.verbose:
        logger.setLevel(logging.DEBUG)

    product = scrape_product_url(args.url, impersonate=args.impersonate)

    if args.json:
        print(product.to_json())
    else:
        print("=" * 60)
        print(f"Scraped URL   : {product.url}")
        print(f"Status Code   : {product.status_code}")
        print(f"Marketplace   : {product.marketplace}")
        print(f"Title         : {product.title}")
        print(f"Price         : {product.currency} {product.price} ({product.original_price_text})")
        print(f"Availability  : {product.availability}")
        print(f"Rating        : {product.rating}")
        print(f"Image URL     : {product.image_url}")
        if product.error:
            print(f"Error         : {product.error}")
        print("=" * 60)


if __name__ == "__main__":
    main()
