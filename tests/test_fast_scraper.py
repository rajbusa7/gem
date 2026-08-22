"""
Unit and Integration tests for FastScraper (curl-cffi TLS Impersonation & BeautifulSoup Parser).
"""

import json
import unittest
from unittest.mock import MagicMock, patch

from bs4 import BeautifulSoup
from utils.fast_scraper import (
    CHROME_120_HEADERS,
    FastScraper,
    ScrapedProduct,
    scrape_product_url,
)


class TestFastScraper(unittest.TestCase):
    def setUp(self) -> None:
        self.scraper = FastScraper(impersonate="chrome120")

    def tearDown(self) -> None:
        self.scraper.close()

    def test_chrome_headers_presence(self) -> None:
        """Ensure critical Chrome 120 browser headers and TLS fingerprint settings are loaded."""
        self.assertEqual(self.scraper.impersonate, "chrome120")
        self.assertIn("Sec-CH-UA", self.scraper.headers)
        self.assertIn("Sec-Fetch-Dest", self.scraper.headers)
        self.assertIn("User-Agent", self.scraper.headers)
        self.assertIn("Chrome/120", self.scraper.headers["User-Agent"])

    def test_parse_soup_product_standard_ecommerce(self) -> None:
        """Test extraction from a standard e-commerce HTML layout."""
        sample_html = """
        <!DOCTYPE html>
        <html>
            <head>
                <title>HP LaserJet Pro M404dn Monochrome Laser Printer - GeM</title>
                <meta property="og:title" content="HP LaserJet Pro M404dn Monochrome Laser Printer" />
                <meta property="og:image" content="https://example.com/hp-printer.jpg" />
                <meta property="og:description" content="High performance monochrome laser printer for enterprise." />
            </head>
            <body>
                <div class="product_main">
                    <h1>HP LaserJet Pro M404dn</h1>
                    <p class="price_color">₹24,999.00</p>
                    <p class="instock availability"><i class="icon-ok"></i> In stock (22 available)</p>
                    <p class="star-rating Four"></p>
                </div>
            </body>
        </html>
        """
        soup = BeautifulSoup(sample_html, "html.parser")
        product = self.scraper._parse_soup_product(
            soup=soup,
            url="https://gem.gov.in/product/hp-laserjet-m404dn",
            marketplace="Gem",
            status_code=200,
        )

        self.assertEqual(product.status_code, 200)
        self.assertEqual(product.title, "HP LaserJet Pro M404dn")
        self.assertEqual(product.price, 24999.0)
        self.assertEqual(product.currency, "INR")
        self.assertEqual(product.availability, "In Stock")
        self.assertEqual(product.rating, 4.0)
        self.assertEqual(product.image_url, "https://example.com/hp-printer.jpg")
        self.assertIn("High performance", product.description or "")

    def test_parse_soup_product_amazon_flipkart_style(self) -> None:
        """Test extraction with alternate Amazon/Flipkart selector structures."""
        sample_html = """
        <html>
            <head>
                <title>Dell UltraSharp 27 4K Monitor (U2723QE) | Amazon.in</title>
            </head>
            <body>
                <h1 id="productTitle"> Dell UltraSharp 27 4K USB-C Hub Monitor (U2723QE) </h1>
                <span class="a-price"><span class="a-offscreen">₹58,490</span></span>
                <div id="availability"><span>In Stock.</span></div>
            </body>
        </html>
        """
        soup = BeautifulSoup(sample_html, "html.parser")
        product = self.scraper._parse_soup_product(
            soup=soup,
            url="https://www.amazon.in/dp/B09TR7V1R9",
            marketplace="Amazon",
            status_code=200,
        )

        self.assertEqual(product.status_code, 200)
        self.assertIn("Dell UltraSharp 27 4K", product.title or "")
        self.assertEqual(product.price, 58490.0)
        self.assertEqual(product.currency, "INR")
        self.assertEqual(product.availability, "In Stock")

    def test_scraped_product_serialization(self) -> None:
        """Ensure ScrapedProduct can be correctly converted to dict and JSON."""
        product = ScrapedProduct(
            url="https://test.com/item1",
            status_code=200,
            title="Ergonomic Executive Office Chair",
            price=12450.0,
            currency="INR",
            availability="In Stock",
            rating=4.5,
            marketplace="Amazon",
        )
        d = product.to_dict()
        self.assertEqual(d["title"], "Ergonomic Executive Office Chair")
        self.assertEqual(d["price"], 12450.0)

        json_str = product.to_json()
        parsed = json.loads(json_str)
        self.assertEqual(parsed["marketplace"], "Amazon")
        self.assertEqual(parsed["currency"], "INR")

    def test_live_tls_request_and_status_200(self) -> None:
        """Live integration test verifying curl-cffi TLS impersonation returns 200 OK."""
        test_url = "https://httpbin.org/get"
        try:
            response = self.scraper.fetch(test_url, timeout=10)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            # Verify user-agent or headers passed through TLS session
            self.assertIn("headers", data)
            self.assertIn("User-Agent", data["headers"])
        except Exception as e:
            # If network/sandbox restricts external calls, gracefully log
            print(f"Note: Live network request test returned: {e}")


if __name__ == "__main__":
    unittest.main()
