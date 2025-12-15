import { useState, useRef, useEffect } from 'react'
import { Room, RoomEvent, Track } from 'livekit-client'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'

export function useVoiceConversation() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [micActive, setMicActive] = useState(false)
  const [error, setError] = useState<string>('')
  const [transcript, setTranscript] = useState<string>('')
  const [aiResponse, setAiResponse] = useState<string>('')
  
  const roomRef = useRef<Room | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const isDisconnectingRef = useRef(false)
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isRecordingRef = useRef(false)
  const isPlayingAudioRef = useRef(false)
  const isProcessingRef = useRef(false)

  const startRecording = (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const source = audioContext.createMediaStreamSource(stream)
    const analyser = audioContext.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)

    let currentRecorder: MediaRecorder | null = null
    let currentChunks: Blob[] = []
    let isSpeaking = false

    const startNewRecording = () => {
      currentChunks = []
      currentRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      })

      currentRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          currentChunks.push(event.data)
        }
      }

      currentRecorder.onstop = () => {
        if (currentChunks.length > 0) {
          const audioBlob = new Blob(currentChunks, { type: 'audio/webm' })
          if (audioBlob.size > 10000) {
            processAudio(audioBlob)
          }
        }
      }

      currentRecorder.start()
    }

    isRecordingRef.current = true
    startNewRecording()

    const checkAudio = () => {
      if (!isRecordingRef.current) return

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length

      if (average > 5) {
        isSpeaking = true
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      } else if (isSpeaking && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          if (currentRecorder && currentRecorder.state === 'recording') {
            currentRecorder.stop()
            isSpeaking = false
            setTimeout(() => startNewRecording(), 100)
          }
          silenceTimerRef.current = null
        }, 2000)
      }

      requestAnimationFrame(checkAudio)
    }
    checkAudio()
  }

  const processAudio = async (audioBlob: Blob) => {
    if (isDisconnectingRef.current || audioBlob.size < 10000 || isProcessingRef.current || isPlayingAudioRef.current) return

    isProcessingRef.current = true
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    const formData = new FormData()
    formData.append('file', audioBlob, 'audio.webm')

    try {
      const transcribeRes = await fetch(`${backendUrl}/transcribe`, {
        method: 'POST',
        body: formData
      })

      if (!transcribeRes.ok) throw new Error('Transcription failed')
      const { text } = await transcribeRes.json()
      if (!text || text.trim().length < 2) {
        isProcessingRef.current = false
        return
      }

      setTranscript(text)

      const respondRes = await fetch(`${backendUrl}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!respondRes.ok) throw new Error('Response failed')
      const { response_text, audio } = await respondRes.json()
      
      setAiResponse(response_text)
      isProcessingRef.current = false

      if (audio) {
        if (audioElementRef.current) {
          audioElementRef.current.pause()
          audioElementRef.current = null
        }

        isPlayingAudioRef.current = true
        const audioBlob = new Blob([Uint8Array.from(atob(audio), c => c.charCodeAt(0))], { type: 'audio/mpeg' })
        const audioElement = new Audio(URL.createObjectURL(audioBlob))
        audioElementRef.current = audioElement
        
        audioElement.onended = () => {
          isPlayingAudioRef.current = false
          audioElementRef.current = null
        }
        
        await audioElement.play()
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed')
      setTimeout(() => setError(''), 3000)
      isProcessingRef.current = false
    }
  }

  const connectToRoom = async () => {
    try {
      setStatus('connecting')
      setError('')

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_name: 'voice-conversation',
          participant_name: `user-${Date.now()}`
        })
      })

      if (!response.ok) throw new Error('Failed to get token')

      const { token, url } = await response.json()
      
      if (!url || !token) {
        throw new Error('Invalid response from server')
      }

      const room = new Room()
      roomRef.current = room

      room.on(RoomEvent.Connected, () => {
        setStatus('connected')
      })

      room.on(RoomEvent.Disconnected, () => {
        setStatus('disconnected')
        setMicActive(false)
      })

      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        if (publication.track?.kind === Track.Kind.Audio) {
          setMicActive(true)
        }
      })

      room.on(RoomEvent.TrackSubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach()
          document.body.appendChild(audioElement)
          audioElement.play()
        }
      })

      await room.connect(url, token)
      await room.localParticipant.setMicrophoneEnabled(true)

      startRecording(stream)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setStatus('disconnected')
    }
  }

  const disconnect = async () => {
    isDisconnectingRef.current = true
    isRecordingRef.current = false
    
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
    
    if (audioElementRef.current) {
      audioElementRef.current.pause()
      audioElementRef.current = null
    }
    
    if (roomRef.current) {
      await roomRef.current.disconnect()
      roomRef.current = null
    }
    
    setTranscript('')
    setAiResponse('')
    setError('')
    isProcessingRef.current = false
    isPlayingAudioRef.current = false
    isDisconnectingRef.current = false
  }

  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect()
      }
    }
  }, [])

  return {
    status,
    micActive,
    error,
    transcript,
    aiResponse,
    connectToRoom,
    disconnect
  }
}
