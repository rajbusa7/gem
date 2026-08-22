"""
Scraper Bridge utility to facilitate integration between backend API services and FastScraper.
Supports single URL scraping, batch scraping, and live price comparison feeds.
"""

from __future__ import annotations

import json
import os
import sys
from typing import Any, Dict, List

# Ensure parent directory is in sys.path when invoked directly as a script
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from utils.fast_scraper import FastScraper, ScrapedProduct
except ImportError:
    from fast_scraper import FastScraper, ScrapedProduct



def scrape_multiple(urls: List[str], impersonate: str = "chrome120") -> List[Dict[str, Any]]:
    """Scrapes a list of URLs concurrently or sequentially using FastScraper."""
    scraper = FastScraper(impersonate=impersonate)
    results = []
    try:
        for url in urls:
            product = scraper.extract_product(url)
            results.append(product.to_dict())
    finally:
        scraper.close()
    return results


def handle_cli_bridge() -> None:
    """Reads JSON payload from stdin or arguments and prints JSON results."""
    try:
        if len(sys.argv) > 1:
            raw_arg = sys.argv[1]
            if raw_arg.startswith("{") or raw_arg.startswith("["):
                payload = json.loads(raw_arg)
            else:
                payload = {"urls": [raw_arg]}
        else:
            payload = json.load(sys.stdin)

        urls = payload.get("urls", []) if isinstance(payload, dict) else payload
        if not urls:
            print(json.dumps({"error": "No URLs provided", "results": []}))
            return

        impersonate = payload.get("impersonate", "chrome120") if isinstance(payload, dict) else "chrome120"
        results = scrape_multiple(urls, impersonate=impersonate)
        print(json.dumps({"success": True, "count": len(results), "results": results}, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e), "results": []}))


if __name__ == "__main__":
    handle_cli_bridge()
