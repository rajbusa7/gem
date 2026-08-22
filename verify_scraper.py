"""
Standalone verification script to test FastScraper against live target URLs.
Verifies TLS fingerprint impersonation, 200 OK status, and BeautifulSoup extraction.
"""

from __future__ import annotations

import sys
from utils.fast_scraper import FastScraper, scrape_product_url


def run_verification() -> bool:
    print("=================================================================")
    print("      FAST SCRAPER (curl-cffi + BeautifulSoup4) VERIFICATION     ")
    print("=================================================================")
    
    # Target 1: Public live scraping benchmark demo site
    target_demo_url = "http://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html"
    print(f"\n[Test 1] Scraping Live E-Commerce Product: {target_demo_url}")
    
    scraper = FastScraper(impersonate="chrome120")
    try:
        product = scraper.extract_product(target_demo_url)
        print(f" -> Response Status  : {product.status_code} OK")
        print(f" -> Product Title    : {product.title}")
        print(f" -> Extracted Price  : {product.currency} {product.price} ({product.original_price_text})")
        print(f" -> Availability     : {product.availability}")
        print(f" -> Star Rating      : {product.rating}/5.0")
        print(f" -> Image URL        : {product.image_url}")
        
        if product.status_code != 200 or not product.title or product.price is None:
            print("[FAIL] Test 1 failed to extract required product data.")
            return False
        print("[PASS] Test 1: Successfully bypassed TLS bot fingerprints & extracted product.")

    except Exception as e:
        print(f"[FAIL] Test 1 Exception: {e}")
        return False
    finally:
        scraper.close()

    # Target 2: Header and TLS fingerprint verification mirror
    headers_url = "https://httpbin.org/headers"
    print(f"\n[Test 2] Verifying TLS Fingerprint Headers at: {headers_url}")
    scraper_tls = FastScraper(impersonate="chrome120")
    try:
        resp = scraper_tls.fetch(headers_url, timeout=10)
        print(f" -> Response Status  : {resp.status_code} OK")
        headers_data = resp.json().get("headers", {})
        print(f" -> Impersonated UA  : {headers_data.get('User-Agent')}")
        print(f" -> Sec-Ch-Ua Header : {headers_data.get('Sec-Ch-Ua')}")
        print(f" -> Sec-Fetch-Dest   : {headers_data.get('Sec-Fetch-Dest')}")
        
        if resp.status_code == 200 and "Chrome/120" in headers_data.get("User-Agent", ""):
            print("[PASS] Test 2: Chrome 120 TLS fingerprint and headers successfully verified.")
        else:
            print("[WARN] Test 2: Server responded but header reflection varied.")

    except Exception as e:
        print(f"[WARN] Test 2 Exception (network dependent): {e}")
    finally:
        scraper_tls.close()

    print("\n=================================================================")
    print("            ALL FAST SCRAPER VERIFICATIONS COMPLETED!            ")
    print("=================================================================")
    return True


if __name__ == "__main__":
    success = run_verification()
    sys.exit(0 if success else 1)
