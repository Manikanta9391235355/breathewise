"""
Property Service for EstateIQ AI.
Provides high-performance search, filtering, and pagination over
the consolidated verified real estate catalog.
"""

import json
import logging
from pathlib import Path
from typing import Any, Optional
from backend.app.core.config import settings
from backend.app.models.schemas import PaginatedProperties, PropertyItem

logger = logging.getLogger("estateiq.services.property")


class PropertyService:
    def __init__(self, catalog_path: Path | None = None):
        self.catalog_path = catalog_path or settings.CATALOG_FILE
        self._properties: list[dict[str, Any]] = []
        self._load_catalog()

    def _load_catalog(self) -> None:
        """Load properties from disk."""
        if not self.catalog_path.exists():
            logger.warning("Catalog file %s does not exist yet", self.catalog_path)
            self._properties = []
            return

        try:
            with open(self.catalog_path, "r", encoding="utf-8") as f:
                self._properties = json.load(f)
            logger.info("PropertyService loaded %d properties from %s", len(self._properties), self.catalog_path)
        except Exception as e:
            logger.error("Failed to load catalog %s: %s", self.catalog_path, e)
            self._properties = []

    def reload(self) -> int:
        self._load_catalog()
        return len(self._properties)

    def get_all(self) -> list[dict[str, Any]]:
        return self._properties

    def get_countries(self) -> list[str]:
        countries = set()
        for p in self._properties:
            c = p.get("country")
            if c:
                countries.add(c)
        return sorted(list(countries))

    def get_property_types(self) -> list[str]:
        types = set()
        for p in self._properties:
            t = p.get("property_type")
            if t:
                types.add(t)
        return sorted(list(types))

    def filter_properties(
        self,
        source: Optional[str] = None,
        country_or_city: Optional[str] = None,
        property_type: Optional[str] = None,
        search_query: Optional[str] = None,
        page: int = 1,
        page_size: int = 12,
    ) -> PaginatedProperties:
        """Filter properties across source, location, type, and text search."""
        filtered = self._properties

        # 1. Source filter
        if source and source.lower() not in ("all", ""):
            src_lower = source.lower()
            filtered = [p for p in filtered if src_lower in p.get("source", "").lower()]

        # 2. Location filter
        if country_or_city and country_or_city.lower() not in ("all", ""):
            loc_lower = country_or_city.lower()
            filtered = [
                p for p in filtered
                if loc_lower in p.get("country", "").lower()
                or loc_lower in p.get("city", "").lower()
                or loc_lower in p.get("location", "").lower()
            ]

        # 3. Property Type filter
        if property_type and property_type.lower() not in ("all", ""):
            type_lower = property_type.lower()
            filtered = [p for p in filtered if type_lower in p.get("property_type", "").lower()]

        # 4. Search query
        if search_query and search_query.strip():
            tokens = search_query.strip().lower().split()
            filtered = [
                p for p in filtered
                if all(
                    token in p.get("name", "").lower()
                    or token in p.get("location", "").lower()
                    or token in p.get("description", "").lower()
                    or token in p.get("developer", "").lower()
                    or any(token in a.lower() for a in p.get("amenities", []))
                    for token in tokens
                )
            ]

        total = len(filtered)
        total_pages = max(1, (total + page_size - 1) // page_size)
        page = max(1, min(page, total_pages))

        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        page_items = [PropertyItem(**item) for item in filtered[start_idx:end_idx]]

        return PaginatedProperties(
            items=page_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )


property_service = PropertyService()
