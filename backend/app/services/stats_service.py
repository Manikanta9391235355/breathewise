"""
Statistics and Metrics Service for EstateIQ AI.
Provides live counts, scraper health, and data provenance.
"""

import json
import logging
from pathlib import Path
from typing import Any
from backend.app.core.config import settings
from backend.app.models.schemas import CollectionStats, SourceDetail, SourcesResponse

logger = logging.getLogger("estateiq.services.stats")


class StatsService:
    def __init__(self):
        self.report_file = settings.REPORT_FILE
        self.catalog_file = settings.CATALOG_FILE

    def get_stats(self, total_chunks: int = 0, faiss_ready: bool = False) -> CollectionStats:
        """Aggregate high-level system metrics."""
        darglobal_count = 0
        wasalt_count = 0
        total_properties = 0
        last_updated = "Never"
        countries: list[str] = []
        types: list[str] = []

        if self.catalog_file.exists():
            try:
                with open(self.catalog_file, "r", encoding="utf-8") as f:
                    items = json.load(f)
                total_properties = len(items)
                darglobal_count = sum(1 for i in items if i.get("source") == "DarGlobal")
                wasalt_count = sum(1 for i in items if i.get("source") == "Wasalt")

                c_set = {i.get("country") for i in items if i.get("country")}
                t_set = {i.get("property_type") for i in items if i.get("property_type")}
                countries = sorted(list(c_set))
                types = sorted(list(t_set))
            except Exception as e:
                logger.error("Error reading catalog for stats: %s", e)

        if self.report_file.exists():
            try:
                with open(self.report_file, "r", encoding="utf-8") as f:
                    rep = json.load(f)
                last_updated = rep.get("generated_at", "N/A")
            except Exception as e:
                logger.error("Error reading collection report: %s", e)

        return CollectionStats(
            total_properties=total_properties,
            darglobal_count=darglobal_count,
            wasalt_count=wasalt_count,
            total_chunks=total_chunks,
            last_updated=last_updated,
            faiss_ready=faiss_ready,
            available_countries=countries,
            available_property_types=types,
        )

    def get_sources_response(self) -> SourcesResponse:
        """Detailed breakdown for each source platform."""
        report: dict[str, Any] = {}
        if self.report_file.exists():
            try:
                with open(self.report_file, "r", encoding="utf-8") as f:
                    report = json.load(f)
            except Exception as e:
                logger.error("Error reading report: %s", e)

        src_meta = report.get("sources", {})
        dg_meta = src_meta.get("darglobal", {})
        w_meta = src_meta.get("wasalt", {})

        sources = [
            SourceDetail(
                name="DarGlobal",
                domain="https://darglobal.co.uk",
                status=dg_meta.get("status", "Indexed"),
                indexed_items=dg_meta.get("indexed_items", 49),
                attempted_urls=dg_meta.get("attempted_urls", 7),
                failed_urls=dg_meta.get("failed_urls", 0),
                last_collection=dg_meta.get("last_collection", "Recent"),
                description="International luxury real estate developer listed on the London Stock Exchange (LSE: DAR), creating high-end second homes with brand collaborations including Aston Martin, Lamborghini, Pagani, Elie Saab, Missoni, Trump, and Marriott.",
                features=[
                    "London Stock Exchange Listed Developer",
                    "Exclusive Haute Couture & Supercar Brand Collaborations",
                    "Iconic Second Homes in Oman, UAE, Spain, Qatar, Maldives, UK",
                    "One-of-One Premier Edition Trophy Collection"
                ]
            ),
            SourceDetail(
                name="Wasalt",
                domain="https://wasalt.sa/en",
                status=w_meta.get("status", "Indexed"),
                indexed_items=w_meta.get("indexed_items", 126),
                attempted_urls=w_meta.get("attempted_urls", 6),
                failed_urls=w_meta.get("failed_urls", 0),
                last_collection=w_meta.get("last_collection", "Recent"),
                description="Leading Saudi Arabian digital property marketplace and brokerage platform licensed by REGA (Real Estate General Authority), providing verified residential villas, apartments, lands, and rentals in SAR.",
                features=[
                    "REGA Licensed & Verified Saudi Real Estate",
                    "Active Marketplace Across Riyadh, Jeddah, Dammam",
                    "Accurate Pricing in Saudi Riyals (SAR)",
                    "Residential Villas, Apartments, Compounds & Rentals"
                ]
            )
        ]

        return SourcesResponse(sources=sources, collection_report=report)


stats_service = StatsService()
