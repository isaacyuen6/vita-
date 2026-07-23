from fastapi.testclient import TestClient

from vita_ai_service.main import create_app


def test_health_returns_typed_contract() -> None:
    response = TestClient(create_app()).get("/health")
    assert response.status_code == 200
    assert response.json()["service"] == "vita-ai-service"
    assert response.json()["status"] == "ok"


def test_ready_returns_ok() -> None:
    response = TestClient(create_app()).get("/ready")
    assert response.status_code == 200
