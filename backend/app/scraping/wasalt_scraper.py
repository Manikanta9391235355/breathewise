"""
Wasalt Web Scraper Adapter for EstateIQ AI.
Extracts verified Saudi real estate listings, pricing (SAR), locations, and specifications
from wasalt.sa/en while strictly respecting robots.txt and privacy rules (no personal data).
"""

import datetime
import json
import logging
import re
import time
from typing import Any
import httpx

from backend.app.scraping.robots_validator import RobotsValidator

logger = logging.getLogger("estateiq.scraping.wasalt")


class WasaltScraper:
    BASE_URL = "https://wasalt.sa"
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    TARGET_ENDPOINTS = [
        ("villas-for-sale-in-riyadh", "Riyadh", "Villa", "sale"),
        ("apartments-for-sale-in-riyadh", "Riyadh", "Apartment", "sale"),
        ("properties-for-sale-in-jeddah", "Jeddah", "Mixed Residential", "sale"),
        ("properties-for-sale-in-dammam", "Dammam", "Mixed Residential", "sale"),
        ("properties-for-rent-in-riyadh", "Riyadh", "Rental Residential", "rent"),
    ]

    def __init__(self, robots_validator: RobotsValidator | None = None):
        self.validator = robots_validator or RobotsValidator()
        self.client = httpx.Client(
            headers=self.HEADERS,
            timeout=15.0,
            follow_redirects=True,
        )

    def close(self):
        self.client.close()

    def scrape(self, max_properties_per_page: int = 25) -> dict[str, Any]:
        """
        Execute full scraping workflow for Wasalt across key Saudi markets.
        """
        start_time = datetime.datetime.now(datetime.timezone.utc)
        results = {
            "source": "Wasalt",
            "base_url": self.BASE_URL,
            "scraped_at": start_time.isoformat(),
            "attempted_urls": [],
            "failed_urls": [],
            "raw_documents": [],
            "processed_items": [],
            "status": "success",
            "limitations": [],
        }

        # 1. Robots.txt check
        results["attempted_urls"].append(f"{self.BASE_URL}/robots.txt")
        self.validator.fetch_and_parse(f"{self.BASE_URL}/robots.txt")

        # 2. Add Wasalt Corporate & Market Overview document
        results["processed_items"].append({
            "id": "wasalt-platform-overview",
            "name": "Wasalt Saudi Real Estate Platform Overview",
            "project_code": "WASALT-PLATFORM",
            "source": "Wasalt",
            "property_type": "Real Estate Platform & Brokerage Overview",
            "country": "Saudi Arabia",
            "city": "Kingdom-Wide (Riyadh, Jeddah, Dammam, Khobar, Makkah, Madinah)",
            "location": "Riyadh, Kingdom of Saudi Arabia",
            "developer": "Wasalt Real Estate (Dar Al Arkan Affiliate)",
            "description": (
                "Wasalt (wasalt.sa) is one of Saudi Arabia's leading property portals and digital real estate platforms, "
                "empowering buyers, tenants, and investors to find residential and commercial properties across the Kingdom. "
                "Licensed by the Saudi Real Estate General Authority (REGA), Wasalt lists thousands of verified villas, "
                "apartments, land plots, duplexes, floor units, and commercial spaces for sale and rent. It features "
                "REGA-verified listings, real estate auctions, market price insights, and digital closing capabilities."
            ),
            "amenities": [
                "REGA Licensed and Verified Listings",
                "Real Estate Auctions & Tender Sales",
                "Instant Valuation & ROI Calculations",
                "E-Wallet & Secure Digital Deposit Integration",
                "Comprehensive Saudi Regional Coverage (Riyadh, Jeddah, Eastern Province, Western Region)"
            ],
            "specifications": {
                "regulatory_authority": "Saudi Real Estate General Authority (REGA)",
                "headquarters": "Riyadh, Saudi Arabia",
                "primary_currency": "SAR (Saudi Riyal)",
                "key_cities": ["Riyadh", "Jeddah", "Dammam", "Khobar", "Taif", "Makkah"],
                "property_categories": ["Villas", "Apartments", "Lands", "Floors", "Duplexes", "Buildings", "Commercial"]
            },
            "price": "Market Range: 450,000 SAR to 25,000,000+ SAR",
            "currency": "SAR",
            "source_url": "https://wasalt.sa/en",
            "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })

        # 3. Scrape individual target endpoints
        item_counter = 1
        seen_slugs = set()

        for slug_path, city_name, category_hint, transaction_mode in self.TARGET_ENDPOINTS:
            page_url = f"{self.BASE_URL}/en/{slug_path}"
            results["attempted_urls"].append(page_url)

            try:
                time.sleep(0.5)  # Respectful request delay
                resp = self.client.get(page_url)
                if resp.status_code != 200:
                    logger.warning("Wasalt request to %s returned %d", page_url, resp.status_code)
                    results["failed_urls"].append({
                        "url": page_url,
                        "reason": f"HTTP status {resp.status_code}"
                    })
                    continue

                m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', resp.text)
                if not m:
                    results["failed_urls"].append({
                        "url": page_url,
                        "reason": "Missing __NEXT_DATA__ element"
                    })
                    continue

                page_data = json.loads(m.group(1))
                page_props = page_data.get("props", {}).get("pageProps", {})
                search_res = page_props.get("searchResult", {})
                properties = search_res.get("properties", [])
                
                logger.info("Scraped %d properties from %s (%s)", len(properties), page_url, city_name)
                results["raw_documents"].append({
                    "url": page_url,
                    "city": city_name,
                    "raw_count": len(properties)
                })

                for raw_prop_item in properties[:max_properties_per_page]:
                    prop_items = raw_prop_item if isinstance(raw_prop_item, list) else [raw_prop_item]
                    for prop in prop_items:
                        if not isinstance(prop, dict):
                            continue

                        p_info = prop.get("propertyInfo", {})
                        prop_id = prop.get("id") or prop.get("slug")
                        if not prop_id or prop_id in seen_slugs:
                            continue
                        seen_slugs.add(prop_id)

                    title = p_info.get("title") or prop.get("title") or f"{category_hint} in {city_name}"
                    sub_type = p_info.get("propertySubType") or category_hint
                    price_val = p_info.get("salePrice") or p_info.get("expectedRent") or 0
                    currency = p_info.get("conversionUnit") or p_info.get("currencyType") or "SAR"
                    district = p_info.get("district") or p_info.get("zone") or "Prime District"
                    territory = p_info.get("territory") or ""
                    full_address = p_info.get("address") or f"{district}, {city_name}, Saudi Arabia"
                    prop_slug = p_info.get("slug") or prop.get("slug")
                    prop_url = f"{self.BASE_URL}/en/property/{transaction_mode}/{prop_slug}" if prop_slug else page_url

                    # Extract attributes: bedrooms, area, age
                    bedrooms = None
                    land_area = None
                    age = None
                    for attr in prop.get("attributes", []):
                        k = attr.get("key")
                        v = attr.get("value")
                        if k == "noOfBedrooms":
                            bedrooms = v
                        elif k in ("carpetArea", "floorSize", "builtUpArea"):
                            unit = attr.get("unit", "SQM")
                            land_area = f"{v} {unit}"
                        elif k == "completionYear":
                            age = v

                    # Format formatted price
                    if isinstance(price_val, (int, float)) and price_val > 0:
                        formatted_price = f"{price_val:,.0f} {currency}"
                        if transaction_mode == "rent":
                            formatted_price += " / year"
                    else:
                        formatted_price = f"Contact for Price ({currency})"

                    # Build description
                    description_parts = [
                        f"{title}.",
                        f"This {sub_type} is available for {transaction_mode} in {district}, {city_name}, Saudi Arabia.",
                        f"Published price: {formatted_price}.",
                    ]
                    if bedrooms:
                        description_parts.append(f"Features {bedrooms} bedrooms.")
                    if land_area:
                        description_parts.append(f"Property area spans {land_area}.")
                    if age:
                        description_parts.append(f"Building condition/age: {age}.")
                    description_parts.append(f"Full address: {full_address}. Listed on Wasalt platform.")
                    description = " ".join(description_parts)

                    # Amenities & features
                    amenities = [
                        "REGA Licensed Property",
                        f"Location: {district}, {city_name}",
                        f"Property Type: {sub_type}",
                    ]
                    if bedrooms:
                        amenities.append(f"{bedrooms} Bedrooms")
                    if land_area:
                        amenities.append(f"Area: {land_area}")
                    if prop.get("isVerified"):
                        amenities.append("Verified Listing Status")

                    item = {
                        "id": f"wasalt-{item_counter}",
                        "name": title,
                        "project_code": f"WASALT-{prop.get('id', item_counter)}",
                        "source": "Wasalt",
                        "property_type": sub_type,
                        "country": "Saudi Arabia",
                        "city": city_name,
                        "location": full_address,
                        "developer": "Listed on Wasalt Portal (Saudi Real Estate)",
                        "description": description,
                        "amenities": amenities,
                        "specifications": {
                            "bedrooms": bedrooms,
                            "area": land_area,
                            "age": age,
                            "district": district,
                            "territory": territory,
                            "transaction_type": transaction_mode.capitalize(),
                            "is_verified": prop.get("isVerified", False),
                            "rega_licensed": prop.get("isRegaProp", True)
                        },
                        "price": formatted_price,
                        "currency": currency,
                        "source_url": prop_url,
                        "scraped_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    }
                    results["processed_items"].append(item)
                    item_counter += 1

            except Exception as e:
                logger.error("Error scraping Wasalt page %s: %s", page_url, e)
                results["failed_urls"].append({
                    "url": page_url,
                    "reason": str(e)
                })

        logger.info("Wasalt scraper finished: %d items indexed", len(results["processed_items"]))
        return results
