"""
Unit and Integration Tests for EstateIQ AI API Endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    """Verify system health endpoint returns operational status."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "index_ready" in data
    assert "total_chunks" in data
    assert data["index_ready"] is True
    assert data["total_chunks"] > 0


def test_stats_endpoint(client):
    """Verify statistics endpoint returns genuine counts."""
    response = client.get("/api/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_properties"] > 0
    assert data["darglobal_count"] > 0
    assert data["wasalt_count"] > 0
    assert data["faiss_ready"] is True
    assert len(data["available_countries"]) > 0


def test_properties_pagination_and_filters(client):
    """Verify property catalog pagination and multi-attribute filters."""
    # Base query
    resp = client.get("/api/properties?page=1&page_size=5")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 5
    assert data["total"] >= 150
    assert data["total_pages"] > 1

    # Filter by DarGlobal
    dg_resp = client.get("/api/properties?source=DarGlobal")
    assert dg_resp.status_code == 200
    dg_data = dg_resp.json()
    assert all(item["source"] == "DarGlobal" for item in dg_data["items"])

    # Filter by Wasalt
    w_resp = client.get("/api/properties?source=Wasalt")
    assert w_resp.status_code == 200
    w_data = w_resp.json()
    assert all(item["source"] == "Wasalt" for item in w_data["items"])

    # Search query
    q_resp = client.get("/api/properties?q=Astera")
    assert q_resp.status_code == 200
    q_data = q_resp.json()
    assert any("Astera" in item["name"] for item in q_data["items"])


def test_sources_endpoint(client):
    """Verify sources reporting endpoint returns valid source audits."""
    response = client.get("/api/sources")
    assert response.status_code == 200
    data = response.json()
    assert len(data["sources"]) == 2
    names = [s["name"] for s in data["sources"]]
    assert "DarGlobal" in names
    assert "Wasalt" in names


def test_model_status_endpoint(client):
    """Verify model status endpoint does not leak secrets."""
    response = client.get("/api/model-status")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "is_configured" in data
    assert "api_key" not in data  # Ensure secret is not exposed


def test_chat_endpoint_grounded(client):
    """Verify chat endpoint retrieves evidence and returns citations."""
    payload = {
        "question": "What luxury developments does DarGlobal have in Oman?",
        "source_filter": "DarGlobal",
    }
    response = client.post("/api/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["citations"]) > 0
    assert any("Oman" in c["location"] or "AIDA" in c["title"] for c in data["citations"])
    assert data["status"] in ("success", "insufficient_evidence", "missing_api_key")
