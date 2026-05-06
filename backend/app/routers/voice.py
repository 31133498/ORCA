from fastapi import APIRouter, Form, Response
from app.services.gemini_service import get_gemini_response
from app.services.queue_service import save_to_queue
from app.models import ChatResponse

router = APIRouter(prefix="/voice", tags=["voice"])

@router.post("/callback")
async def voice_callback(
    isActive: str = Form(...),
    callerNumber: str = Form(None),
    sessionId: str = Form(...),
    direction: str = Form(None)
):
    """Africa's Talking Voice Webhook."""
    if isActive == "1":
        # Initial call or ongoing - for demo, we'll keep it simple
        # If we had DTMF or text from user (via STT), we'd use it.
        # But AT Voice is typically DTMF or fixed flow.
        # For a "wow" demo, we assumed browser mic for user speech.
        # If they call via phone, we might need a prompt first.
        
        message = "Hello, I am ORCA from MTN. How can I help you today?"
        # For simplicity in demo, we'll just have the agent speak.
        # In a real AT app, you'd use <GetDigits> or similar.
        
        # Respond with XML
        xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say>{message}</Say>
</Response>"""
        return Response(content=xml, media_type="application/xml")
    
    return Response(content='<?xml version="1.0" encoding="UTF-8"?><Response></Response>', media_type="application/xml")

@router.post("/process")
async def process_voice_reply(
    text: str = Form(...),
    sessionId: str = Form(...)
):
    """
    Helper to process a voice reply (e.g., if we used an STT service or 
    the frontend handled STT and just wants the XML response for AT).
    """
    reply, meta = await get_gemini_response(text, [])
    
    # Store in queue
    chat_res = ChatResponse(
        reply=reply,
        classification=meta["classification"],
        churn_score=meta["churn_score"],
        summary=meta["summary"],
        detected_language=meta["detected_language"]
    )
    save_to_queue(chat_res, [{"speaker": "user", "text": text}, {"speaker": "agent", "text": reply}])
    
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
    <Say voice="en-US-Wavenet-C">{reply}</Say>
</Response>"""
    return Response(content=xml, media_type="application/xml")
