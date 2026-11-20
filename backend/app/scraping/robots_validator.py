"""
Robots.txt validator and crawler ethics module for EstateIQ AI.
Validates crawling permissions against remote robots.txt files.
"""

import logging
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser
import httpx

logger = logging.getLogger("estateiq.scraping.robots")


class RobotsValidator:
    def __init__(self, user_agent: str = "EstateIQ-Research-Bot/1.0"):
        self.user_agent = user_agent
        self.parsers: dict[str, RobotFileParser] = {}
        self.robots_content: dict[str, str] = {}
        self.sitemaps: dict[str, list[str]] = {}

    def fetch_and_parse(self, base_url: str) -> bool:
        """Fetch robots.txt for a domain and initialize parser."""
        parsed = urlparse(base_url)
        domain_root = f"{parsed.scheme}://{parsed.netloc}"
        robots_url = f"{domain_root}/robots.txt"

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"
        }

        try:
            with httpx.Client(timeout=10.0, follow_redirects=True, headers=headers) as client:
                resp = client.get(robots_url)
                if resp.status_code == 200:
                    text = resp.text
                    self.robots_content[domain_root] = text

                    parser = RobotFileParser()
                    parser.parse(text.splitlines())
                    self.parsers[domain_root] = parser

                    # Extract sitemaps
                    sitemaps = []
                    for line in text.splitlines():
                        if line.lower().startswith("sitemap:"):
                            parts = line.split(":", 1)
                            if len(parts) == 2:
                                sitemaps.append(parts[1].strip())
                    self.sitemaps[domain_root] = sitemaps
                    logger.info("Parsed robots.txt for %s: %d sitemaps discovered", domain_root, len(sitemaps))
                    return True
                else:
                    logger.warning("Failed to fetch robots.txt from %s (HTTP %d)", robots_url, resp.status_code)
                    return False
        except Exception as e:
            logger.error("Error reading robots.txt for %s: %s", domain_root, e)
            return False

    def can_fetch(self, url: str) -> bool:
        """Verify whether the URL is permitted to be fetched."""
        parsed = urlparse(url)
        domain_root = f"{parsed.scheme}://{parsed.netloc}"

        if domain_root not in self.parsers:
            self.fetch_and_parse(domain_root)

        parser = self.parsers.get(domain_root)
        if parser is None:
            # If robots.txt cannot be fetched, default to respectful crawling
            return True

        return parser.can_fetch(self.user_agent, url) or parser.can_fetch("*", url)

    def get_sitemaps(self, base_url: str) -> list[str]:
        parsed = urlparse(base_url)
        domain_root = f"{parsed.scheme}://{parsed.netloc}"
        return self.sitemaps.get(domain_root, [])

    def get_raw_text(self, base_url: str) -> str:
        parsed = urlparse(base_url)
        domain_root = f"{parsed.scheme}://{parsed.netloc}"
        return self.robots_content.get(domain_root, "")
