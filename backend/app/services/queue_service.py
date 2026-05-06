import json
import os
import redis
from datetime import datetime
from typing import List, Dict, Any
from app.config import settings

QUEUE_FILE = "conversation_queue.json"
REDIS_KEY = "orca:complaints"

# Redis client
try:
    r = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        db=settings.REDIS_DB,
        decode_responses=True
    )
except:
    r = None

def save_to_queue(chat_response, transcript: List[Dict[str, str]]):
    """Save each voice interaction to Redis (shared) or local JSON."""
    entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "channel": "voice",
        "customer": {
            "name": "Baba Sikira",
            "phone": "+2348123456789"
        },
        "complaint": chat_response.classification,
        "churn_score": chat_response.churn_score,
        "summary": chat_response.summary,
        "transcript": transcript,
        "decision": "escalate" if chat_response.churn_score > 70 else "monitor"
    }
    
    # Try Redis first
    if r:
        try:
            r.lpush(REDIS_KEY, json.dumps(entry))
            return
        except Exception as e:
            print(f"Redis save error: {e}")

    # Fallback to local JSON
    if not os.path.exists(QUEUE_FILE):
        with open(QUEUE_FILE, "w") as f:
            json.dump([], f)
    with open(QUEUE_FILE, "r") as f:
        queue = json.load(f)
    queue.append(entry)
    with open(QUEUE_FILE, "w") as f:
        json.dump(queue, f, indent=2)

def get_queue() -> List[Dict[str, Any]]:
    """Retrieve all entries."""
    if r:
        try:
            items = r.lrange(REDIS_KEY, 0, -1)
            return [json.loads(i) for i in items]
        except Exception as e:
            print(f"Redis fetch error: {e}")
            
    if not os.path.exists(QUEUE_FILE):
        return []
    with open(QUEUE_FILE, "r") as f:
        return json.load(f)