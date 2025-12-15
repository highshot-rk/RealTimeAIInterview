# Frontend Application

Next.js 15 application with TypeScript for real-time AI voice conversations.

## Tech Stack

- **Next.js 15.1.3** - React framework with App Router
- **React 18.3.1** - UI library
- **TypeScript 5.7.2** - Type safety
- **Tailwind CSS 3.4.17** - Styling
- **LiveKit Client 2.9.0** - WebRTC for audio streaming

## Setup

```bash
npm install
```

## Configuration

Create `.env.local`:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Development

```bash
npm run dev
```

Open http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── app/
│   ├── globals.css          # Global styles
│   ├── icon.svg             # Favicon
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   └── AIVoiceConversation.tsx  # Main UI component
├── hooks/
│   └── useVoiceConversation.ts  # Voice conversation logic
└── package.json
```

## Components

### `AIVoiceConversation.tsx`
Main UI component that displays:
- Connection status indicator
- Microphone status
- User transcript (what you said)
- AI response text
- Error messages
- Connect/Disconnect buttons

### `useVoiceConversation.ts`
Custom hook handling:
- LiveKit room connection
- Audio recording with Voice Activity Detection (VAD)
- Silence detection (2 seconds)
- API calls to backend (transcribe, respond)
- Audio playback of AI responses

## Features

### Voice Activity Detection
- Continuously monitors audio levels
- Detects when user starts speaking
- Detects 2 seconds of silence
- Automatically sends audio to backend

### Audio Processing Flow
1. User speaks → Audio recorded continuously
2. User stops (2s silence) → Recording stops
3. Audio sent to backend → Transcribed
4. Transcript displayed immediately
5. AI generates response → Text + Audio returned
6. AI response displayed and played
7. Ready for next question

### Blocking Mechanism
- Cannot send new audio while backend is processing
- Cannot send new audio while AI audio is playing
- Ensures sequential conversation flow

## Key Functions

### `checkAudio()`
Monitors microphone input in real-time:
- Analyzes audio frequency levels
- Detects speech (average > 5)
- Triggers 2-second silence timer
- Stops recording when silence detected

### `processAudio()`
Handles complete conversation cycle:
1. Sends audio to `/transcribe` endpoint
2. Displays transcribed text
3. Sends text to `/respond` endpoint
4. Displays AI response text
5. Plays AI response audio

### `startRecording()`
Sets up continuous audio recording:
- Creates MediaRecorder with WebM format
- Configures Web Audio API for analysis
- Starts Voice Activity Detection loop
- Restarts recording after each sentence

## Environment Variables

- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL (default: http://localhost:8000)

## Dependencies

- `livekit-client` - WebRTC client for audio streaming
- `next` - React framework
- `react` - UI library
- `tailwindcss` - Utility-first CSS

## Browser Requirements

- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)
- Microphone access permission
- HTTPS (or localhost for development)
