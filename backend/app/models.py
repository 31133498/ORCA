from pydantic import BaseModel
from typing import List, Dict, Optional

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []   # [{"role": "user", "content": "..."}, ...]

class ChatResponse(BaseModel):
    reply: str
    classification: str          # DATA_DEPLETION, NETWORK_ISSUE, BILLING, OTHER
    churn_score: int             # 0-100
    summary: str
    detected_language: str       # "en", "yo", "ha"
    action_taken: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    language: str                # "en", "yo", "ha"
    voice_id: Optional[str] = None

class TTSResponse(BaseModel):
    audio_url: str               # URL of generated audio (Spitch returns a direct URL)
    duration_sec: float