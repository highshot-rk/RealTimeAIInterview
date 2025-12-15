import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def transcribe_audio(audio_data: bytes, filename: str = "audio.webm") -> str:
    """Transcribe audio using OpenAI Whisper"""
    try:
        response = await client.audio.transcriptions.create(
            model="whisper-1",
            file=(filename, audio_data),
            language="en", # specify language if known or leave it to auto-detect
            response_format="text",
            temperature=0.0
        )
        return response if isinstance(response, str) else response.text
    except Exception as e:
        print(f"Transcription error: {e}")
        return ""

async def generate_response(text: str) -> str:
    """Generate AI response using GPT"""
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful, friendly voice assistant. Give clear, accurate, and concise responses in 1-2 sentences."},
                {"role": "user", "content": text}
            ],
            max_tokens=150,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"GPT error: {e}")
        return "I'm sorry, I couldn't process that."

async def text_to_speech(text: str) -> bytes:
    """Convert text to speech using OpenAI TTS"""
    try:
        response = await client.audio.speech.create(
            model="tts-1-hd",
            voice="alloy",
            input=text,
            speed=1.0
        )
        return response.content
    except Exception as e:
        print(f"TTS error: {e}")
        return b""
