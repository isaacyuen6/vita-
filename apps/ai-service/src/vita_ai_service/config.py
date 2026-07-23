from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="AI_", extra="ignore")

    service_name: str = "vita-ai-service"
    version: str = "0.1.0"


@lru_cache
def get_settings() -> Settings:
    return Settings()
