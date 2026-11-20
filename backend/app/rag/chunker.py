"""
Document Chunking and Preprocessing Module for EstateIQ AI RAG Pipeline.
Normalizes real estate records into semantic, metadata-rich chunks
sized ~500-800 tokens with sensible overlap and preserved source URLs.
"""

import json
import logging
import re
from pathlib import Path
from typing import Any

logger = logging.getLogger("estateiq.rag.chunker")


class DocumentChunker:
    def __init__(self, target_chunk_size: int = 600, chunk_overlap: int = 100):
        self.target_chunk_size = target_chunk_size
        self.chunk_overlap = chunk_overlap

    def clean_text(self, text: str) -> str:
        """Strip boilerplate whitespace, unescape entities, and normalize."""
        if not text:
            return ""
        # Remove extra whitespace and linebreaks
        cleaned = re.sub(r"\s+", " ", text).strip()
        # Remove any HTML tags if present
        cleaned = re.sub(r"<[^>]+>", "", cleaned)
        return cleaned

    def format_item_to_text(self, item: dict[str, Any]) -> str:
        """Convert a structured property or project dictionary into a rich text document."""
        source = item.get("source", "Unknown")
        name = item.get("name", "Untitled")
        prop_type = item.get("property_type", "Real Estate")
        country = item.get("country", "")
        city = item.get("city", "")
        location = item.get("location", f"{city}, {country}")
        developer = item.get("developer", "N/A")
        price = item.get("price", "Price on Application")
        url = item.get("source_url", "")
        description = self.clean_text(item.get("description", ""))
        amenities = item.get("amenities", [])
        specs = item.get("specifications", {})

        parts = [
            f"=== REAL ESTATE RECORD: {name} ===",
            f"Source Platform: {source}",
            f"Project/Property Title: {name}",
            f"Property Classification: {prop_type}",
            f"Country: {country}",
            f"City/District: {city}",
            f"Full Location Address: {location}",
            f"Developer / Managing Agency: {developer}",
            f"Published Price: {price}",
            f"Official Webpage URL: {url}",
            f"\n--- Overview and Details ---",
            description,
        ]

        if amenities:
            amenities_str = ", ".join(amenities) if isinstance(amenities, list) else str(amenities)
            parts.append(f"\nKey Amenities & Facilities: {amenities_str}")

        if specs:
            spec_lines = []
            for k, v in specs.items():
                if v:
                    formatted_k = k.replace("_", " ").title()
                    spec_lines.append(f"- {formatted_k}: {v}")
            if spec_lines:
                parts.append("\nSpecifications:\n" + "\n".join(spec_lines))

        return "\n".join(parts)

    def chunk_document(self, item: dict[str, Any]) -> list[dict[str, Any]]:
        """Split a document into 500-800 token chunks with metadata preservation."""
        full_text = self.format_item_to_text(item)
        words = full_text.split()

        # Word-based token proxy (~1 word ~ 1.3 tokens -> 450-500 words ~ 600 tokens)
        words_per_chunk = int(self.target_chunk_size / 1.3)
        overlap_words = int(self.chunk_overlap / 1.3)

        chunks = []
        doc_id = item.get("id", "doc")
        source = item.get("source", "Unknown")
        name = item.get("name", "Real Estate Property")
        source_url = item.get("source_url", "")
        location = item.get("location", "")
        price = item.get("price", "")
        prop_type = item.get("property_type", "")

        if len(words) <= words_per_chunk:
            # Single chunk suffices
            chunk_obj = {
                "chunk_id": f"{doc_id}-chunk-0",
                "doc_id": doc_id,
                "title": name,
                "source": source,
                "source_url": source_url,
                "location": location,
                "price": price,
                "property_type": prop_type,
                "text": full_text,
                "chunk_index": 0,
                "total_chunks": 1,
            }
            chunks.append(chunk_obj)
        else:
            step = words_per_chunk - overlap_words
            chunk_idx = 0
            for start_idx in range(0, len(words), step):
                end_idx = min(start_idx + words_per_chunk, len(words))
                chunk_words = words[start_idx:end_idx]
                chunk_text = " ".join(chunk_words)

                header_prefix = f"[{source.upper()} — {name} ({location})]\n"
                if not chunk_text.startswith("==="):
                    chunk_text = header_prefix + chunk_text

                chunk_obj = {
                    "chunk_id": f"{doc_id}-chunk-{chunk_idx}",
                    "doc_id": doc_id,
                    "title": name,
                    "source": source,
                    "source_url": source_url,
                    "location": location,
                    "price": price,
                    "property_type": prop_type,
                    "text": chunk_text,
                    "chunk_index": chunk_idx,
                    "total_chunks": 0,  # Updated below
                }
                chunks.append(chunk_obj)
                chunk_idx += 1
                if end_idx >= len(words):
                    break

            for c in chunks:
                c["total_chunks"] = len(chunks)

        return chunks

    def process_catalog(self, catalog_path: str | Path) -> list[dict[str, Any]]:
        """Load property catalog and generate all semantic chunks."""
        catalog_file = Path(catalog_path)
        if not catalog_file.exists():
            raise FileNotFoundError(f"Catalog file not found: {catalog_file}")

        with open(catalog_file, "r", encoding="utf-8") as f:
            items = json.load(f)

        all_chunks = []
        for item in items:
            chunks = self.chunk_document(item)
            all_chunks.extend(chunks)

        logger.info("Processed %d items into %d chunks", len(items), len(all_chunks))
        return all_chunks
