# Backend API

FastAPI backend for real-time AI voice conversations using LiveKit and OpenAI.

## Setup

```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

## Configuration

Create `.env` file:
```
LIVEKIT_API_KEY=your_livekit_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_URL=ws://localhost:7880
OPENAI_API_KEY=sk-your-openai-key
```

## Run

```bash
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

## API Endpoints

### GET /
Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "ai_enabled": true,
  "livekit_configured": true
}
```

### POST /token
Generate LiveKit access token for room connection.

**Request**:
```json
{
  "room_name": "voice-conversation",
  "participant_name": "user-123"
}
```

**Response**:
```json
{
  "token": "...",
  "url": "ws://localhost:7880"
}
```

### POST /transcribe
Transcribe audio to text using OpenAI Whisper.

**Request**:
- Content-Type: `multipart/form-data`
- Body: Audio file (webm format)

**Response**:
```json
{
  "text": "Hello, how are you?"
}
```

**Notes**:
- Returns empty text if audio is too small (< 5000 bytes)

### POST /respond
Generate AI response with audio using GPT-4o-mini and OpenAI TTS.

**Request**:
```json
{
  "text": "Hello, how are you?"
}
```

**Response**:
```json
{
  "response_text": "I'm doing great, thank you for asking! How can I help you today?",
  "audio": "base64_encoded_audio_data..."
}
```

**Notes**:
- Audio is returned as base64-encoded MP3
- Uses GPT-4o-mini for response generation
- Uses TTS-1-HD for high-quality speech synthesis

## Error Handling

All endpoints return standard HTTP error codes:
- `400` - Bad request (invalid input)
- `500` - Server error (OpenAI/LiveKit not configured or processing failed)

## Dependencies

- FastAPI - Web framework
- OpenAI - AI services (Whisper, GPT-4o-mini, TTS)
- LiveKit - WebRTC infrastructure
- python-dotenv - Environment variable management
