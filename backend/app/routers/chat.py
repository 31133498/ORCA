from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import Response
from app.models import ChatResponse, TTSRequest
from app.services.gemini_service import get_gemini_response
from app.services.spitch_service import text_to_speech
from app.services.queue_service import save_to_queue

router = APIRouter(prefix="/chat", tags=["chat"])

# simple in-memory transcript per session (for demo only)
session_transcripts = {}

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    message: Optional[str] = Form(None),
    history: Optional[str] = Form("[]"),
    audio: Optional[UploadFile] = File(None)
):
    try:
        import json
        history_list = json.loads(history)
        
        audio_bytes = await audio.read() if audio else None
        mime_type = audio.content_type if audio else "audio/mpeg"
        
        reply, meta = await get_gemini_response(
            message=message, 
            history=history_list, 
            audio_bytes=audio_bytes,
            mime_type=mime_type
        )
        
        response = ChatResponse(
            reply=reply,
            classification=meta["classification"],
            churn_score=meta["churn_score"],
            summary=meta["summary"],
            detected_language=meta["detected_language"],
            action_taken=meta.get("action_taken")
        )
        
        # store transcript
        session_id = "baba_sikira_demo"
        if session_id not in session_transcripts:
            session_transcripts[session_id] = []
        
        user_text = message or "[Audio Message]"
        session_transcripts[session_id].append({"speaker": "user", "text": user_text})
        session_transcripts[session_id].append({"speaker": "agent", "text": reply})
        
        save_to_queue(response, session_transcripts[session_id])
        return response
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tts")
async def tts_endpoint(req: TTSRequest):
    """Returns raw audio bytes as an MP3 stream. No file storage needed."""
    try:
        audio_data = await text_to_speech(req.text, req.language)
        if not audio_data:
            raise HTTPException(status_code=503, detail="TTS not configured (no API key)")
        return Response(content=audio_data, media_type="audio/mpeg")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Spitch TTS error: {str(e)}")

@router.get("/queue")
async def get_queue():
    from app.services.queue_service import get_queue
    return {"queue": get_queue()}