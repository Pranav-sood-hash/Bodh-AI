import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useSettings } from '@/context/SettingsContext';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Pause,
  Play,
  Sparkles,
  MessageSquare,
  Volume1,
  MessageSquareText
} from 'lucide-react';

interface VoiceChatOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
}

type VoiceStatus = 'idle' | 'listening' | 'processing' | 'speaking' | 'paused';

export default function VoiceChatOverlay({ isOpen, onClose, chatId }: VoiceChatOverlayProps) {
  const { sendMessage } = useChat();
  const { settings } = useSettings();

  const [status, setStatus] = useState<VoiceStatus>('idle');
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showTranscript, setShowTranscript] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef<any>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isComponentMounted = useRef(true);

  // Check speech support
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const speechSupported = !!SpeechRecognition;

  useEffect(() => {
    isComponentMounted.current = true;
    
    // Auto-start greeting on open
    if (isOpen) {
      handleGreeting();
    }

    return () => {
      isComponentMounted.current = false;
      cleanupSpeech();
    };
  }, [isOpen]);

  const cleanupSpeech = () => {
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.abort();
      } catch (e) {
        console.error('Error aborting recognition:', e);
      }
    }
  };

  // Convert settings language name to BCP 47 code
  const getLanguageCode = (lang: string) => {
    switch (lang.toLowerCase()) {
      case 'hindi': return 'hi-IN';
      case 'english': return 'en-US';
      case 'spanish': return 'es-ES';
      case 'french': return 'fr-FR';
      case 'german': return 'de-DE';
      default: return 'en-US';
    }
  };

  // Speak AI text using window.speechSynthesis
  const speakText = (text: string, onDoneCallback?: () => void) => {
    if (!window.speechSynthesis || isMuted) {
      if (onDoneCallback) onDoneCallback();
      return;
    }

    // Cancel any active speech
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();

    // Clean text: strip markdown characters for cleaner audio reading
    const cleanText = text
      .replace(/[*_`#]/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Set voice configuration from SettingsContext
    utterance.pitch = settings.pitch || 1.0;
    utterance.rate = settings.speed || 1.0;
    utterance.lang = getLanguageCode(settings.selectedLanguage);

    // Look for matching voice if possible
    const voices = window.speechSynthesis.getVoices();
    const targetLang = getLanguageCode(settings.selectedLanguage);
    
    // Attempt to match selectedVoice (e.g. Atlas, Horizon, etc.) or language
    let selectedVoiceObj = voices.find(
      (v) => 
        v.name.toLowerCase().includes(settings.selectedVoice.toLowerCase()) &&
        v.lang.startsWith(targetLang.split('-')[0])
    );

    if (!selectedVoiceObj) {
      // Fallback 1: match language
      selectedVoiceObj = voices.find((v) => v.lang.startsWith(targetLang.split('-')[0]));
    }
    if (!selectedVoiceObj) {
      // Fallback 2: match default voice
      selectedVoiceObj = voices.find((v) => v.default);
    }

    if (selectedVoiceObj) {
      utterance.voice = selectedVoiceObj;
    }

    utterance.onstart = () => {
      if (isComponentMounted.current) {
        setStatus('speaking');
      }
    };

    utterance.onend = () => {
      if (isComponentMounted.current) {
        if (onDoneCallback) {
          onDoneCallback();
        } else {
          // Default: transition to listening when speaking ends
          startListening();
        }
      }
    };

    utterance.onerror = (e) => {
      console.error('Utterance error:', e);
      if (isComponentMounted.current) {
        if (onDoneCallback) onDoneCallback();
        else setStatus('idle');
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  // Perform active speech recognition (listening)
  const startListening = () => {
    if (!speechSupported) {
      setError('Speech recognition is not supported in this browser.');
      setStatus('idle');
      return;
    }

    cleanupSpeech();
    setStatus('listening');
    setError('');
    setUserTranscript('');

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = getLanguageCode(settings.selectedLanguage);
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event: any) => {
      const text = event.results[0][0].transcript;
      if (isComponentMounted.current) {
        setUserTranscript(text);
        setStatus('processing');
        
        // Send spoken query to AI
        const resMsg = await sendMessage(chatId, text, 'VOICE_ASSISTANT');
        if (resMsg && isComponentMounted.current) {
          setAiResponse(resMsg.text);
          speakText(resMsg.text);
        } else if (isComponentMounted.current) {
          setError('Failed to reach BodhAI. Tap orb to try again.');
          setStatus('idle');
        }
      }
    };

    recognition.onerror = (e: any) => {
      const errType = e.error || '';
      if (errType !== 'no-speech' && errType !== 'aborted') {
        console.error('Speech recognition error:', e);
      }
      if (isComponentMounted.current) {
        // If it was aborted or no speech detected, go to idle
        if (errType === 'no-speech' || errType === 'aborted') {
          setStatus('idle');
        } else {
          setError('Microphone error: ' + errType);
          setStatus('idle');
        }
      }
    };

    recognition.onend = () => {
      if (isComponentMounted.current && status === 'listening') {
        setStatus('idle');
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Failed to start recognition:', e);
    }
  };

  const handleGreeting = () => {
    setStatus('processing');
    const greeting = settings.selectedLanguage.toLowerCase() === 'hindi' 
      ? 'नमस्ते! मैं बोध एआई हूँ। आज हम किस बारे में बात करने वाले हैं?'
      : `Hello! I am BodhAI, your voice learning mentor. What concept are we mastering today?`;
    setAiResponse(greeting);
    
    // Give speech synthesis engine 100ms to load voices if needed
    setTimeout(() => {
      speakText(greeting);
    }, 150);
  };

  // User manual control triggers
  const handleOrbClick = () => {
    if (status === 'speaking') {
      // Interrupt: stop speaking and listen
      cleanupSpeech();
      startListening();
    } else if (status === 'listening') {
      // Pause listening
      cleanupSpeech();
      setStatus('idle');
    } else if (status === 'idle' || status === 'paused') {
      // Resume listening
      startListening();
    }
  };

  const handlePauseToggle = () => {
    if (status === 'paused') {
      startListening();
    } else {
      cleanupSpeech();
      setStatus('paused');
    }
  };

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    if (!isMuted && status === 'speaking') {
      // If we mute while speaking, cancel current voice output
      if (utteranceRef.current) {
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
      startListening();
    }
  };

  if (!isOpen) return null;

  // Visual classes based on state
  const getOrbStateStyles = () => {
    switch (status) {
      case 'listening':
        return {
          bg: 'bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_50px_rgba(34,211,238,0.4)]',
          core: 'bg-cyan-500 scale-105 shadow-[0_0_30px_rgba(34,211,238,0.8)]',
          label: 'Listening...',
          labelColor: 'text-cyan-400'
        };
      case 'processing':
        return {
          bg: 'bg-purple-500/10 border-purple-400/40 shadow-[0_0_50px_rgba(168,85,247,0.4)]',
          core: 'bg-purple-600 animate-pulse scale-95 shadow-[0_0_30px_rgba(168,85,247,0.8)]',
          label: 'Thinking...',
          labelColor: 'text-purple-400'
        };
      case 'speaking':
        return {
          bg: 'bg-pink-500/10 border-pink-400/40 shadow-[0_0_50px_rgba(244,63,94,0.4)]',
          core: 'bg-pink-500 scale-110 shadow-[0_0_30px_rgba(244,63,94,0.8)]',
          label: 'BodhAI is speaking',
          labelColor: 'text-pink-400'
        };
      case 'paused':
        return {
          bg: 'bg-slate-800/20 border-slate-700/40 shadow-none',
          core: 'bg-slate-600 scale-90 shadow-none',
          label: 'Voice mode paused',
          labelColor: 'text-slate-400'
        };
      default:
        return {
          bg: 'bg-slate-700/10 border-slate-600/30 hover:border-slate-500/40 shadow-none',
          core: 'bg-slate-500 hover:scale-105 hover:bg-slate-400 transition-all',
          label: 'Tap orb to speak',
          labelColor: 'text-slate-300'
        };
    }
  };

  const orbStyles = getOrbStateStyles();

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#090D16] via-[#0B0F19] to-black text-white flex flex-col items-center justify-between p-6 overflow-hidden select-none">
      
      {/* Background glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-650/20 rounded-full blur-3xl opacity-20 pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl opacity-20 pointer-events-none animate-pulse duration-7000" />

      {/* Top Header Row */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400 animate-spin" style={{ animationDuration: '3s' }} />
          <div>
            <h2 className="text-sm font-black tracking-wide bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">BodhAI IMMERSIVE VOICE</h2>
            <p className="text-[10px] text-slate-550 font-bold uppercase tracking-wider">
              {settings.selectedVoice} • {settings.selectedLanguage} ({settings.accent})
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Center Interactive Orb */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8 z-10">
        
        {/* Pulsing Outer Ripple Circles */}
        <div className="relative flex items-center justify-center w-72 h-72">
          
          {/* Animated Wave Rings (Only when listening or speaking) */}
          {status === 'listening' && (
            <>
              <div className="absolute w-full h-full rounded-full border border-cyan-400/20 animate-ping opacity-30" style={{ animationDuration: '2s' }} />
              <div className="absolute w-5/6 h-5/6 rounded-full border border-cyan-400/25 animate-ping opacity-20" style={{ animationDuration: '2s', animationDelay: '0.6s' }} />
              <div className="absolute w-2/3 h-2/3 rounded-full border border-cyan-400/30 animate-ping opacity-15" style={{ animationDuration: '2s', animationDelay: '1.2s' }} />
            </>
          )}

          {status === 'speaking' && (
            <>
              <div className="absolute w-full h-full rounded-full border border-pink-400/20 animate-pulse opacity-40 scale-105" />
              <div className="absolute w-11/12 h-11/12 rounded-full border border-pink-400/30 animate-pulse opacity-25 scale-110" style={{ animationDelay: '0.4s' }} />
            </>
          )}

          {status === 'processing' && (
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/30 animate-spin" style={{ animationDuration: '8s' }} />
          )}

          {/* Main Glassmorphic Container Orb */}
          <button
            onClick={handleOrbClick}
            className={`w-52 h-52 rounded-full border backdrop-blur-xl flex items-center justify-center transition-all duration-500 ease-out cursor-pointer focus:outline-none ${orbStyles.bg}`}
          >
            {/* Core Solid Blob */}
            <div
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ease-out ${orbStyles.core}`}
            >
              {/* Center status icon */}
              {status === 'listening' && <Mic className="w-12 h-12 text-slate-900" />}
              {status === 'processing' && <Sparkles className="w-12 h-12 text-white animate-pulse" />}
              {status === 'speaking' && <Volume2 className="w-12 h-12 text-slate-900 animate-bounce" />}
              {status === 'paused' && <Play className="w-12 h-12 text-white ml-1" />}
              {status === 'idle' && <Mic className="w-12 h-12 text-white" />}
            </div>
          </button>
        </div>

        {/* Status Prompt Label */}
        <div className="text-center space-y-2">
          <p className={`text-md font-bold tracking-wide transition-colors duration-300 ${orbStyles.labelColor}`}>
            {orbStyles.label}
          </p>
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest select-none">
            {status === 'speaking' ? 'Tap orb to interrupt / listen' : 'Tap orb to pause / speak'}
          </p>
        </div>
      </div>

      {/* Live Transcript / Dialogue View */}
      {showTranscript && (
        <div className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 space-y-4 z-10 backdrop-blur-md max-h-40 overflow-y-auto scrollbar-thin">
          
          {/* User Transcript Line */}
          {userTranscript && (
            <div className="flex gap-2.5 items-start">
              <span className="text-[10px] bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 px-2 py-0.5 rounded font-extrabold uppercase shrink-0 mt-0.5">
                You
              </span>
              <p className="text-xs font-semibold text-slate-200 italic leading-relaxed">
                "{userTranscript}"
              </p>
            </div>
          )}

          {/* AI Response Line */}
          {aiResponse && (
            <div className="flex gap-2.5 items-start border-t border-white/5 pt-3">
              <span className="text-[10px] bg-purple-500/20 text-purple-400 border border-purple-400/30 px-2 py-0.5 rounded font-extrabold uppercase shrink-0 mt-0.5">
                BodhAI
              </span>
              <p className="text-xs font-medium text-slate-300 leading-relaxed">
                {aiResponse}
              </p>
            </div>
          )}

          {/* Placeholder when idle */}
          {!userTranscript && !aiResponse && (
            <p className="text-xs text-slate-500 text-center font-medium italic select-none">
              Start speaking to see transcription log...
            </p>
          )}

          {/* Show error */}
          {error && (
            <p className="text-xs text-rose-400 text-center font-bold">
              ⚠️ {error}
            </p>
          )}
        </div>
      )}

      {/* Bottom Button Action Panel */}
      <div className="w-full max-w-4xl border-t border-white/5 pt-6 flex items-center justify-around z-10">
        
        {/* Toggle Transcript */}
        <button
          onClick={() => setShowTranscript(!showTranscript)}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
            showTranscript ? 'text-purple-400 hover:text-purple-300' : 'text-slate-500 hover:text-slate-450'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
            <MessageSquareText className="w-4 h-4" />
          </div>
          <span>Transcript</span>
        </button>

        {/* Play/Pause Control */}
        <button
          onClick={handlePauseToggle}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
            status === 'paused' ? 'text-cyan-400 hover:text-cyan-300' : 'text-slate-400 hover:text-slate-300'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center hover:bg-white/20 hover:scale-105 transition-all">
            {status === 'paused' ? <Play className="w-5 h-5 text-white ml-0.5" /> : <Pause className="w-5 h-5 text-white" />}
          </div>
          <span>{status === 'paused' ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Mute Control */}
        <button
          onClick={handleMuteToggle}
          className={`flex flex-col items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition ${
            isMuted ? 'text-rose-450 hover:text-rose-400' : 'text-slate-500 hover:text-slate-450'
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </div>
          <span>{isMuted ? 'Muted' : 'Sound'}</span>
        </button>

      </div>
    </div>
  );
}
