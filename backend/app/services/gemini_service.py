import json
import re
from typing import Optional, List, Dict
import google.generativeai as genai
from app.config import settings
from app.prompts import build_system_prompt

genai.configure(api_key=settings.GEMINI_API_KEY)
model = genai.GenerativeModel("gemini-2.5-flash-lite")

def parse_gemini_response(full_text: str):
    if "---JSON---" not in full_text:
        return full_text.strip(), {
            "classification": "OTHER",
            "churn_score": 50,
            "summary": "No classification",
            "detected_language": "en",
            "action_taken": None
        }
    reply_part, json_part = full_text.split("---JSON---", 1)
    reply = reply_part.strip()
    try:
        match = re.search(r'\{.*\}', json_part, re.DOTALL)
        if match:
            meta = json.loads(match.group())
        else:
            raise ValueError("No JSON object")
    except Exception as e:
        print(f"JSON parse error: {e}")
        meta = {
            "classification": "OTHER",
            "churn_score": 50,
            "summary": "Parse error",
            "detected_language": "en",
            "action_taken": None
        }
    return reply, meta

async def get_gemini_response(
    message: Optional[str] = None, 
    history: List[Dict[str, str]] = [], 
    audio_bytes: Optional[bytes] = None, 
    mime_type: str = "audio/mpeg"
):
    system = build_system_prompt()
    
    # We'll use a single turn for simplicity or history sequence
    parts = [{"text": system}]
    
    # History context (merged into a single string for prompt efficiency in demo)
    history_text = "\n"
    for turn in history:
        role = "User" if turn["role"] == "user" else "ORCA"
        history_text += f"{role}: {turn['content']}\n"
    
    if history_text.strip():
        parts.append({"text": history_text})
        
    # User input parts
    if audio_bytes:
        parts.append({"mime_type": mime_type, "data": audio_bytes})
    if message:
        parts.append({"text": f"Current User Input: {message}"})
    
    if not parts:
        raise ValueError("No input provided (message or audio)")
    
    # Generate
    response = await model.generate_content_async(parts)
    raw = response.text
    reply, meta = parse_gemini_response(raw)
    return reply, meta