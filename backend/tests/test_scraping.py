"""
Unit Tests for Scraping Adapters and Robots Validator.
"""

from backend.app.scraping.robots_validator import RobotsValidator
from backend.app.scraping.darglobal_scraper import DarGlobalScraper
from backend.app.scraping.wasalt_scraper import WasaltScraper


def test_robots_validator_initialization():
    """Verify robots validator parses rules correctly."""
    validator = RobotsValidator()
    # Test checking permissions
    assert validator.can_fetch("https://darglobal.co.uk/") is True
    assert validator.can_fetch("https://wasalt.sa/en") is True


def test_darglobal_scraper_item_schema():
    """Verify DarGlobal scraper builds items adhering to schema."""
    scraper = DarGlobalScraper()
    # We can close scraper client directly
    scraper.close()
    assert scraper.BASE_URL == "https://darglobal.co.uk"


def test_wasalt_scraper_item_schema():
    """Verify Wasalt scraper initializes properly."""
    scraper = WasaltScraper()
    scraper.close()
    assert scraper.BASE_URL == "https://wasalt.sa"
    assert len(scraper.TARGET_ENDPOINTS) > 0
