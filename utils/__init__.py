"""
Utils package for fast scraping, TLS impersonation, and HTML extraction.
"""

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .fast_scraper import FastScraper, ScrapedProduct, scrape_product_url

__all__ = ["FastScraper", "ScrapedProduct", "scrape_product_url"]
