from spitch import Spitch
from app.config import settings

# Initialize client
client = Spitch(api_key=settings.SPITCH_API_KEY)

LANGUAGE_VOICE_MAP = {
    "en": "sade",
    "yo": "sade",
    "ha": "sade"
}

async def text_to_speech(text: str, language: str = "en") -> bytes:
    """Call Spitch SDK and return raw audio bytes directly."""
    if not settings.SPITCH_API_KEY or settings.SPITCH_API_KEY == "your_spitch_app_api_key":
        # Mock: return empty bytes (frontend should handle gracefully)
        return b""
    
    response = client.speech.generate(
        text=text,
        language=language,
        voice=LANGUAGE_VOICE_MAP.get(language, "sade"),
        format="mp3"
    )
    return response.read()