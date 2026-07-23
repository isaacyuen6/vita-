from datetime import UTC, datetime
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

from vita_ai_service.config import Settings, get_settings


class HealthResponse(BaseModel):
    service: Literal["vita-ai-service"]
    status: Literal["ok"]
    timestamp: datetime
    version: str


def create_app(settings: Settings | None = None) -> FastAPI:
    app_settings = settings or get_settings()
    app = FastAPI(title="Vita AI Service", version=app_settings.version)

    def response() -> HealthResponse:
        return HealthResponse(
            service="vita-ai-service",
            status="ok",
            timestamp=datetime.now(UTC),
            version=app_settings.version,
        )

    @app.get("/health", response_model=HealthResponse, tags=["platform"])
    async def health() -> HealthResponse:
        return response()

    @app.get("/ready", response_model=HealthResponse, tags=["platform"])
    async def ready() -> HealthResponse:
        return response()

    return app


app = create_app()
