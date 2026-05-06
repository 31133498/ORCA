import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SPITCH_API_KEY: str = os.getenv("SPITCH_API_KEY", "")
    
    # Africa's Talking Settings
    AT_USERNAME: str = os.getenv("AT_USERNAME", "sandbox")
    AT_API_KEY: str = os.getenv("AT_API_KEY", "")
    AT_PHONE_NUMBER: str = os.getenv("AT_PHONE_NUMBER", "")

    # Redis (single URL for production, e.g. redis://...)
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # Baba Sikira profile (hardcoded)
    BABA_PROFILE = {
        "name": "Baba Sikira",
        "phone": "+2348123456789",
        "plan": "MTN Pulse",
        "last_recharge": {"amount": 500, "date": "yesterday", "method": "USSD"},
        "current_data_balance": "1.5 GB",
        "past_issues": ["Complained about fast data depletion last week"],
        "churn_risk": "medium-high"
    }

settings = Settings()