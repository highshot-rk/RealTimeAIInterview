"""FastAPI backend for Real-Time AI Voice Conversation."""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from livekit import api
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import logging
from ai_handler import transcribe_audio as ai_transcribe, generate_response, text_to_speech as ai_tts

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="AI Voice Conversation API",
    description="Backend API for real-time AI voice conversations using LiveKit and OpenAI",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "")
LIVEKIT_URL = os.getenv("LIVEKIT_URL", "ws://localhost:7880")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

if not OPENAI_API_KEY:
    logger.warning("OpenAI API key not configured - AI features will be disabled")

class TokenRequest(BaseModel):
    room_name: str
    participant_name: str

class ChatRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "ai_enabled": bool(OPENAI_API_KEY),
        "livekit_configured": bool(LIVEKIT_API_KEY and LIVEKIT_API_SECRET)
    }

@app.post("/token")
async def get_token(request: TokenRequest):
    if not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        raise HTTPException(status_code=500, detail="LiveKit credentials not configured")
    
    try:
        token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
        token.with_identity(request.participant_name).with_name(request.participant_name).with_grants(
            api.VideoGrants(
                room_join=True,
                room=request.room_name,
                can_publish=True,
                can_subscribe=True
            )
        )
        
        return {"token": token.to_jwt(), "url": LIVEKIT_URL}
    except Exception as e:
        logger.error(f"Token generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI not configured")
    
    try:
        audio_data = await file.read()
        if len(audio_data) < 5000:
            return {"text": ""}
        
        text = await ai_transcribe(audio_data, file.filename or "audio.webm")
        if not text:
            return {"text": ""}
        
        logger.info(f"Transcribed: {text[:50]}...")
        return {"text": text}
        
    except Exception as e:
        logger.error(f"Transcription failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# We can response once with transcription and TTS audio but for UI/UX clarity, separate endpoints are better.
@app.post("/respond")
async def generate_ai_response(request: ChatRequest):
    if not OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI not configured")
    
    if not request.text.strip():
        return {"response_text": "", "audio": ""}
    
    try:
        response_text = await generate_response(request.text)
        audio_bytes = await ai_tts(response_text)
        
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        
        logger.info(f"Response: {response_text[:50]}...")
        return {"response_text": response_text, "audio": audio_base64}
        
    except Exception as e:
        logger.error(f"Response failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
