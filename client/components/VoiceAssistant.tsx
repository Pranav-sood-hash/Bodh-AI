import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Loader } from 'lucide-react';

type Status = 'idle' | 'listening' | 'processing' | 'speaking';

interface Message {
  type: 'user' | 'ai';
  text: string;
}

export default function VoiceAssistant() {
  const [status, setStatus] = useState<Status>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [textInput, setTextInput] = useState('');
  const recognitionRef = useRef<any>(null);

  // Check if browser supports speech recognition
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setStatus('idle');
    window.speechSynthesis.speak(utterance);
  };

  const getAIResponse = async (userText: string) => {
    setStatus('processing');
    setError('');

    try {
      // Use localStorage API key if available, otherwise server will use environment variable
      const apiKey = localStorage.getItem('groqApiKey');

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }],
          system_prompt:
            'You are Bodh AI, a friendly voice learning mentor. Give clear, concise answers in 2-3 sentences maximum since your response will be spoken aloud. Avoid using bullet points, markdown, or special characters.',
          model: 'llama-3.3-70b-versatile',
          max_tokens: 256,
          stream: false,
          ...(apiKey && { apiKey }),
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage = errorData.error?.message || errorData.error || 'Failed to get AI response';
        throw new Error(errorMessage);
      }

      const data = await res.json();
      const aiText = data.message;

      setMessages((prev) => [
        ...prev,
        { type: 'user', text: userText },
        { type: 'ai', text: aiText },
      ]);

      setStatus('speaking');
      speakText(aiText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get a response. Please try again.');
      setStatus('idle');
    }
  };

  const handleStartListening = () => {
    if (!speechSupported) {
      // Fallback: use a text prompt
      const userText = window.prompt('Speech not supported. Type your question:');
      if (userText?.trim()) {
        setTranscript(userText);
        getAIResponse(userText);
      }
      return;
    }

    setError('');
    setTranscript('');
    setStatus('listening');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      setTranscript(spokenText);
      getAIResponse(spokenText);
    };

    recognition.onerror = () => {
      setError('Could not hear you. Please try again.');
      setStatus('idle');
    };

    recognition.onend = () => {
      setStatus((currentStatus) => (currentStatus === 'listening' ? 'idle' : currentStatus));
    };

    recognition.start();
  };

  const handlePlayResponse = () => {
    const lastAI = [...messages].reverse().find((m) => m.type === 'ai');
    if (lastAI) {
      setStatus('speaking');
      speakText(lastAI.text);
    }
  };

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      recognitionRef.current?.abort();
    };
  }, []);

  const statusConfig = {
    idle: { label: 'Click to speak', color: 'from-purple-500 to-pink-500' },
    listening: { label: 'Listening...', color: 'from-cyan-400 to-blue-500' },
    processing: { label: 'Processing...', color: 'from-purple-400 to-purple-600' },
    speaking: { label: 'Speaking...', color: 'from-pink-400 to-pink-600' },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="space-y-6">
      {/* Main Mic Button */}
      <div className="flex flex-col items-center justify-center py-12 space-y-8">
        <button
          onClick={handleStartListening}
          disabled={status !== 'idle'}
          className={`relative w-40 h-40 rounded-full bg-gradient-to-br ${currentStatus.color} p-1 hover:scale-105 disabled:scale-100 smooth-transition neon-glow`}
        >
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
            {status === 'idle' ? (
              <Mic className="w-20 h-20 text-white" />
            ) : (
              <Loader className="w-20 h-20 text-white animate-spin" />
            )}
          </div>

          {/* Ripple effect */}
          {status !== 'idle' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-current opacity-30 animate-pulse"></div>
              <div
                className="absolute inset-0 rounded-full border-2 border-current opacity-20 animate-pulse"
                style={{ animationDelay: '0.3s' }}
              ></div>
            </>
          )}
        </button>

        {/* Status indicator */}
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text">
            {currentStatus.label}
          </p>
          {transcript && <p className="text-slate-300 text-sm">{transcript}</p>}
          {!speechSupported && (
            <p className="text-yellow-400 text-xs">
              🎤 Mic not supported in this browser — use the keyboard input below
            </p>
          )}
        </div>
      </div>

      {/* Interactive Text Input Fallback / Alternative */}
      <div className="max-w-md mx-auto w-full pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (textInput.trim() && status === 'idle') {
              setTranscript(textInput);
              getAIResponse(textInput);
              setTextInput('');
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            disabled={status !== 'idle'}
            placeholder="Type a message to Bodh AI..."
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 smooth-transition"
          />
          <button
            type="submit"
            disabled={status !== 'idle' || !textInput.trim()}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm smooth-transition neon-glow"
          >
            Send
          </button>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-200 text-sm text-center">
          {error}
        </div>
      )}

      {/* Messages Display */}
      {messages.length > 0 && (
        <div className="glass-dark rounded-lg p-6 space-y-4 max-h-96 overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-lg ${
                  msg.type === 'user'
                    ? 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 border border-purple-500/50 text-slate-100'
                    : 'bg-slate-800/50 border border-slate-700/50 text-slate-300'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            </div>
          ))}

          {/* Play last AI response */}
          {messages[messages.length - 1]?.type === 'ai' && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handlePlayResponse}
                disabled={status === 'speaking'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 smooth-transition disabled:opacity-50"
              >
                <Volume2 className="w-4 h-4" />
                {status === 'speaking' ? 'Playing...' : 'Play Response'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {messages.length === 0 && (
        <div className="glass-dark rounded-lg p-8 text-center space-y-3 border-dashed border-2 border-slate-700/50">
          <p className="text-slate-400">No conversation yet</p>
          <p className="text-sm text-slate-500">
            Click the mic button above to start your learning session
          </p>
        </div>
      )}
    </div>
  );
}
