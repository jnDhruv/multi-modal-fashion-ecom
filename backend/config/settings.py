"""
settings.py — Application Configuration
========================================
Reads environment variables using pydantic-settings.
All configuration is centralized here so other modules
just import `settings` and use it directly.
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file from the backend directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))


class Settings(BaseSettings):
    """
    Application settings read from environment variables.
    Pydantic-settings automatically reads from .env files.
    """

    # Gemini API Configuration
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # App Configuration
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    # CORS Configuration
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000,http://localhost:4173"

    # Mock Data Configuration
    USE_MOCK_DATA: bool = True

    # ml model Retrieval API
    RETRIEVAL_API_URL: str = "http://localhost:8001"

    class Config:
        env_file = ".env"
        extra = "ignore"

    def get_allowed_origins(self) -> list:
        """Parse the comma-separated ALLOWED_ORIGINS string into a list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]


# Single global instance — import this everywhere
settings = Settings()
