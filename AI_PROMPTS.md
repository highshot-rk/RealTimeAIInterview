# AI Tool Usage Documentation

## AI Tools Used

**Amazon Q Developer** - AI coding assistant integrated in IDE
**sonnet4.5 thinking** - AI coding assistant integrated in Cursor

## Key Prompts Used

### 1. Initial Project Setup
**Prompt:** "Create a real-time AI voice conversation app using LiveKit, OpenAI Whisper, GPT, and TTS"

**What it accomplished:**
- Generated complete project structure (frontend + backend)
- Set up FastAPI backend with LiveKit integration
- Created Next.js frontend with TypeScript
- Configured all necessary dependencies

**Result:** Solid foundation with proper architecture

---

### 2. Backend Optimization
**Prompt:** "In main and ai_handler, I think there are same functions. Could you optimize backend code?"

**What it accomplished:**
- Identified duplicate OpenAI API calls
- Refactored to use centralized ai_handler module
- Removed code duplication
- Improved maintainability

**Result:** DRY principle applied, cleaner codebase

---

### 3. Audio Processing Flow
**Prompt:** "User speak sentences. If user do not speak for 2 seconds, frontend will send audio data to backend. Backend process audio and response transcribed text as soon as possible. Backend process transcribed text and return response audio and text to frontend."

**What it accomplished:**
- Implemented Voice Activity Detection (VAD)
- Added 2-second silence detection
- Created sequential processing flow
- Separated transcription and response endpoints

**Result:** Natural conversation flow with proper timing

---

### 4. Audio Quality Issues
**Prompt:** "I did not say anything but transcribed text generated automatically. I think the accuracy is poor. Need to modify audio quality like normalize, histogram, etc. Capture only current user's loudly voice."

**What it accomplished:**
- Initially tried pydub for audio processing (required ffmpeg)
- Switched to Web Audio API for client-side processing
- Implemented audio level detection
- Added silence filtering

**Result:** Better audio quality and noise filtering

---

### 5. Code Organization
**Prompt:** "In frontend, can we separate a little with component and script?"

**What it accomplished:**
- Created custom hook (useVoiceConversation.ts)
- Separated business logic from UI
- Improved code maintainability
- Made logic reusable

**Result:** Clean separation of concerns, ~300 lines reduced to ~100 in component

---

## Prompts That Didn't Work Well

### 1. Complex Audio Processing
**Prompt:** "Need to modify audio quality like normalize, histogram, etc."

**Why it didn't work:**
- Suggested pydub library which required ffmpeg installation
- Added unnecessary complexity
- Windows compatibility issues

**Solution:** Simplified to use Web Audio API on frontend instead

---

### 2. Accumulating Audio Chunks
**Initial approach:** Tried to accumulate multiple audio chunks into single blob

**Why it didn't work:**
- Combining WebM chunks created corrupted files
- OpenAI API rejected invalid format

**Solution:** Stop and restart MediaRecorder for each sentence to create valid WebM files

---

## Lessons Learned

1. **Start simple** - Web Audio API was simpler than server-side audio processing
2. **Test incrementally** - Audio format issues caught early through testing
3. **Clear requirements** - Specific prompts about timing (2 seconds) led to better results
4. **Iterative refinement** - Multiple prompts to optimize and clean up code
5. **Separation of concerns** - Asking to separate logic from UI improved code quality

---

## AI Assistance Impact

- **Time saved:** ~80% faster than manual implementation
- **Code quality:** Consistent patterns and best practices
- **Problem solving:** Quick iterations on audio processing issues
- **Documentation:** Generated comprehensive README files
- **Optimization:** Identified and removed duplicate code efficiently
