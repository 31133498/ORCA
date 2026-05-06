import os
from pathlib import Path
from typing import ClassVar, Dict, Any
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

# Load .env from the backend root regardless of the process CWD
_env_path = Path(__file__).parent.parent / ".env"
load_dotenv(_env_path)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Apify (for Twitter scraping)
    apify_token: str = os.getenv("APIFY_TOKEN", "")
    apify_actor: str = "apidojo/tweet-scraper"

    # Operator info
    operator_handle: str = "MTNNigeria"
    operator_name: str = "MTN Nigeria"

    # LLM (Anthropic)
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    anthropic_model: str = "claude-sonnet-4-6"

    # LLM (Google Gemini)
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # TTS (Spitch)
    spitch_api_key: str = os.getenv("SPITCH_API_KEY", "")

    # Africa's Talking Settings
    at_username: str = os.getenv("AT_USERNAME", "sandbox")
    at_api_key: str = os.getenv("AT_API_KEY", "")
    at_phone_number: str = os.getenv("AT_PHONE_NUMBER", "")

    # Redis
    redis_url: str = os.getenv("REDIS_URL", "")

    # Frontend
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./orca.db")

    # Baba Sikira profile (hardcoded for demo)
    BABA_PROFILE: ClassVar[Dict[str, Any]] = {
        "name": "Baba Sikira",
        "phone": "+2348123456789",
        "plan": "MTN Pulse",
        "last_recharge": {"amount": 500, "date": "yesterday", "method": "USSD"},
        "current_data_balance": "1.5 GB",
        "past_issues": ["Complained about fast data depletion last week"],
        "churn_risk": "medium-high"
    }


settings = Settings()
