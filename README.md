# AI Voice Conversation App

Real-time AI voice conversation application using OpenAI Whisper, GPT-4o-mini, and TTS with LiveKit for WebRTC audio streaming.

## Features

- 🎤 **Voice Activity Detection** - Automatically detects when you start and stop speaking
- 🗣️ **Real-time Transcription** - Converts speech to text using OpenAI Whisper
- 🤖 **AI Responses** - Generates intelligent responses using GPT-4o-mini
- 🔊 **Text-to-Speech** - Plays AI responses with high-quality voice synthesis
- ⏱️ **2-Second Silence Detection** - Automatically sends audio after you finish speaking
- 🔄 **Sequential Flow** - Prevents overlapping conversations for natural interaction

## Tech Stack

**Backend:**
- FastAPI
- OpenAI API (Whisper, GPT-4o-mini, TTS-1-HD)
- LiveKit
- Python 3.11+

**Frontend:**
- Next.js 15
- TypeScript
- LiveKit Client
- Tailwind CSS

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key
- LiveKit credentials (optional, for production)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

Create `backend/.env`:
```
OPENAI_API_KEY=sk-your-key-here
LIVEKIT_API_KEY=your-key
LIVEKIT_API_SECRET=your-secret
LIVEKIT_URL=ws://localhost:7880
```

Run backend:
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

Run frontend:
```bash
npm run dev
```

Open http://localhost:3000

## Documentation

📖 **[Backend Documentation](backend/README.md)** - API endpoints, configuration, dependencies

📖 **[Frontend Documentation](frontend/README.md)** - Components, hooks, architecture

📖 **[AI Prompts](AI_PROMPTS.md)** - AI tools and prompts used during development

## Project Structure

```
skill.io/
├── backend/
│   ├── main.py              # FastAPI app with endpoints
│   ├── ai_handler.py        # OpenAI integrations
│   ├── requirements.txt     # Python dependencies
│   └── README.md           # Backend documentation
├── frontend/
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── hooks/              # Custom hooks
│   └── README.md          # Frontend documentation
├── README.md              # This file
└── AI_PROMPTS.md         # AI assistance documentation
```

## How It Works

1. **User speaks** → Frontend records audio continuously
2. **2 seconds of silence** → Recording stops, audio sent to backend
3. **Backend transcribes** → OpenAI Whisper converts speech to text
4. **Text displayed** → User sees transcription immediately
5. **AI generates response** → GPT-4o-mini creates reply
6. **Response played** → TTS converts text to speech and plays audio
7. **Ready for next question** → Cycle repeats

## API Endpoints

- `GET /` - Health check
- `POST /token` - Generate LiveKit access token
- `POST /transcribe` - Transcribe audio to text
- `POST /respond` - Generate AI response with audio

## 🎬 Demo

**Live Application Demo:**  
🔗 [Watch Full Demo](https://www.loom.com/share/a63220de061a4379b2888f4006fba01b) - Complete walkthrough of the AI voice conversation app

**Additional Demo:**  
🔗 [Extended Demo](https://www.loom.com/share/213dd54eddc44d8788695b3a4f82306a) - Additional features and functionality