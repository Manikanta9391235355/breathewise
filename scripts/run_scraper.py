#!/usr/bin/env python3
"""
CLI entry point to execute the EstateIQ AI web scraper.
Collects public data from DarGlobal and Wasalt, validates robots.txt,
and persists raw and processed records under data/raw and data/processed.
"""

import json
import logging
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.app.scraping.pipeline import ScrapingPipeline

def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    logger = logging.getLogger("estateiq.cli.scraper")
    logger.info("Initializing EstateIQ Web Scraper...")

    pipeline = ScrapingPipeline()
    report = pipeline.run()

    print("\n" + "=" * 60)
    print("ESTATEIQ AI — SCRAPING SUMMARY")
    print("=" * 60)
    print(f"Total Pages Attempted: {report['metrics']['total_pages_attempted']}")
    print(f"Total Pages Succeeded: {report['metrics']['total_pages_succeeded']}")
    print(f"Total Properties Indexed: {report['metrics']['total_items_indexed']}")
    print(f" - DarGlobal Developments: {report['metrics']['darglobal_items_count']}")
    print(f" - Wasalt Saudi Listings:  {report['metrics']['wasalt_items_count']}")
    print(f"Failed URLs: {len(report['failed_urls'])}")
    print(f"Duration: {report['execution_duration_seconds']:.2f} seconds")
    print("=" * 60)

if __name__ == "__main__":
    main()
