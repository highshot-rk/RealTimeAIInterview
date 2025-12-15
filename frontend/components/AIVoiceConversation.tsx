'use client'

import { useVoiceConversation } from '@/hooks/useVoiceConversation'

export default function AIVoiceConversation() {
  const { status, micActive, error, transcript, aiResponse, connectToRoom, disconnect } = useVoiceConversation()

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500'
      case 'connecting': return 'bg-yellow-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      default: return 'Disconnected'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        AI Voice Conversation
      </h1>

      <div className="flex items-center justify-center mb-6">
        <div className={`w-4 h-4 rounded-full ${getStatusColor()} mr-3 animate-pulse`} />
        <span className="text-lg font-medium text-gray-700">{getStatusText()}</span>
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" />
          </svg>
          <span className="text-gray-700">
            Microphone: <span className={micActive ? 'text-green-600 font-semibold' : 'text-gray-500'}>
              {micActive ? 'Active' : 'Inactive'}
            </span>
          </span>
        </div>
      </div>

      {transcript && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">You said:</p>
          <p className="text-gray-800">{transcript}</p>
        </div>
      )}

      {aiResponse && (
        <div className="mb-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">AI response:</p>
          <p className="text-gray-800">{aiResponse}</p>
        </div>
      )}



      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {status === 'disconnected' ? (
          <button
            onClick={connectToRoom}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            Start Conversation
          </button>
        ) : (
          <button
            onClick={disconnect}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            End Conversation
          </button>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>{status === 'connected' ? 'Listening... Speak naturally' : 'Click "Start Conversation" to begin'}</p>
      </div>
    </div>
  )
}
