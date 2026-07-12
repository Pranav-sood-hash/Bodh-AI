import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import { useSettings } from '@/context/SettingsContext';
import { useProfile } from '@/hooks/useProfile';
import useApiKeys from '@/hooks/useApiKeys';
import { useDebate } from '@/hooks/useDebate';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import CodePlayground from '@/components/chat/CodePlayground';
import CompareView from '@/components/chat/CompareView';
import VoiceChatOverlay from '@/components/chat/VoiceChatOverlay';
import DebateSetupModal from '@/components/debate/DebateSetupModal';
import DebateProgress from '@/components/debate/DebateProgress';
import DebateResult from '@/components/debate/DebateResult';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader } from '@/components/ui/loader';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Globe,
  Trash2,
  FileCode,
  X,
  Menu
} from 'lucide-react';

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { chats, activeChatId, setActiveChatId, sendMessage, deleteChat, refreshMessages } = useChat();
  const { settings } = useSettings();
  const { profile } = useProfile();
  const { keys } = useApiKeys();
  const { status, statusMessage, currentRound, rounds, progress, isDebating, startDebate, reset } = useDebate();

  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [debateRounds, setDebateRounds] = useState(3);
  const [debateProviders, setDebateProviders] = useState<string[]>([]);

  const [input, setInput] = useState('');
  const [isDictating, setIsDictating] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [isVoiceOverlayOpen, setIsVoiceOverlayOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Determine chat session details
  const chatSession = chats.find((c) => c.id === id) || chats.find((c) => c.id === activeChatId) || null;

  const connectedProviders = keys.filter(k => k.isActive).map(k => k.provider);

  const handleStartDebate = async (params: { providers: string[]; rounds: number; mode: string; question: string }) => {
    setIsSetupModalOpen(false);
    setDebateRounds(params.rounds);
    setDebateProviders(params.providers);

    const questionText = params.question.trim();
    setInput('');

    if (chatSession) {
      await startDebate({
        chatId: chatSession.id,
        question: questionText,
        providers: params.providers,
        totalRounds: params.rounds,
        mode: params.mode
      });
      await refreshMessages(chatSession.id);
      reset();
    }
  };

  // Auto-open voice overlay for brand new speech mode sessions
  useEffect(() => {
    if (chatSession && chatSession.mode === 'voice' && chatSession.messages.length <= 1) {
      setIsVoiceOverlayOpen(true);
    }
  }, [chatSession?.id]);
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }
    if (id) {
      setActiveChatId(id);
    } else if (chatSession) {
      navigate(`/chat/${chatSession.id}`);
    }
  }, [id, chatSession, navigate, setActiveChatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSession?.messages, isSending]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() && attachedFiles.length === 0) return;

    if (chatSession) {
      const textToSend = input.trim();
      setInput('');
      setAttachedFiles([]);
      setIsSending(true);
      try {
        await sendMessage(chatSession.id, textToSend);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleDelete = () => {
    if (chatSession) {
      deleteChat(chatSession.id);
      navigate('/dashboard');
    }
  };

  const handleAttachFile = () => {
    const sampleFiles = ['main.py', 'bubble_sort.py', 'Index.tsx', 'styles.css'];
    const randomFile = sampleFiles[Math.floor(Math.random() * sampleFiles.length)];
    if (!attachedFiles.includes(randomFile)) {
      setAttachedFiles((prev) => [...prev, randomFile]);
    }
  };

  const handleRemoveAttachment = (filename: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f !== filename));
  };

  const handleSpeechToggle = () => {
    setIsVoiceOverlayOpen(true);
  };

  const promptChips = [
    'Analyze Big-O runtime of QuickSort vs BubbleSort.',
    'Deconstruct Redux middleware functions.',
    'Write a rate limiter middleware in Express.',
    'Explain how promises work in ES6.',
  ];

  if (!chatSession) {
    return (
      <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex items-center justify-center font-sans">
        <div className="text-center space-y-4">
          <p className="text-slate-500 font-medium">Initializing premium workspace...</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider smooth-transition"
          >
            Go back dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar userName={userName} />

      {/* Workspace Area */}
      <div className="flex-1 lg:pl-[var(--sidebar-width)] flex flex-col h-screen min-w-0 relative transition-all duration-300">
        
        {/* Mobile top bar */}
        <MobileTopBar
          title={chatSession.title}
          rightSlot={
            <button
              onClick={handleDelete}
              title="Delete session"
              className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 flex items-center justify-center transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          }
        />

        {/* Desktop Workspace TopNav Header */}
        <header className="hidden lg:flex h-16 border-b border-slate-200/80 bg-white px-6 items-center justify-between shrink-0 select-none sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-[10px] bg-cyan-50 text-cyan-600 border border-cyan-200 px-2.5 py-1 rounded-lg font-bold tracking-wider uppercase leading-none flex-shrink-0">
              {chatSession.mode === 'voice' ? '🎙️ Speech' : chatSession.mode === 'compare' ? '🧠 Architecture' : '📚 Technical doubts'}
            </span>
            <h2 className="text-xs font-bold text-slate-850 truncate max-w-sm">{chatSession.title}</h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            {chatSession.mode === 'voice' && (
              <button
                onClick={() => setIsVoiceOverlayOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-[10px] uppercase tracking-wide hover:brightness-110 smooth-transition shadow-sm active:scale-95 flex-shrink-0 animate-pulse"
              >
                <Mic className="w-3.5 h-3.5" /> Launch Voice Overlay
              </button>
            )}
            <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 text-cyan-500" />
              Voice Mode: <span className="text-cyan-600 font-bold">{settings.selectedVoice} ({settings.selectedLanguage})</span>
            </div>
            <button
              onClick={handleDelete}
              title="Delete session"
              className="w-8 h-8 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200 flex items-center justify-center smooth-transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Messaging Pane */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          
          {chatSession.messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex w-full gap-4 max-w-4xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none shadow-sm">
                    AI
                  </div>
                )}

                {/* Message Box */}
                <div className="space-y-4 max-w-[90%] flex-1">
                  
                  {/* Text bubble */}
                  <div
                    className={`rounded-2xl p-4 text-xs font-medium leading-relaxed ${
                      isUser
                        ? 'bg-blue-50 border border-blue-200 text-blue-900 ml-auto max-w-lg shadow-sm'
                        : msg.messageType === 'DEBATE'
                        ? 'bg-white border border-slate-200/80 text-slate-700 mr-auto shadow-sm w-full'
                        : 'bg-white border border-slate-200/80 text-slate-700 mr-auto shadow-sm'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : msg.messageType === 'DEBATE' && msg.debateData ? (
                      <DebateResult
                        synthesis={JSON.parse(msg.debateData).synthesis}
                        rounds={JSON.parse(msg.debateData).rounds}
                        providers={JSON.parse(msg.debateData).providers}
                      />
                    ) : (
                      <div className="prose prose-sm prose-slate max-w-none text-xs [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[11px] [&_code]:font-mono [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_h1]:text-sm [&_h2]:text-xs [&_h3]:text-xs [&_h4]:text-xs [&_strong]:text-slate-800">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                    <span className="text-[9px] text-slate-450 block text-right mt-2 select-none font-semibold">
                      {msg.timestamp}
                    </span>
                  </div>

                  {/* Code sandbox block */}
                  {msg.codePlayground && (
                    <div className="w-full">
                      <CodePlayground
                        chatId={chatSession.id}
                        messageId={msg.id}
                        initialCode={msg.codePlayground.code}
                        initialOutput={msg.codePlayground.output}
                      />
                    </div>
                  )}

                  {/* Comparative paradigm view */}
                  {msg.compareData && (
                    <div className="w-full">
                      <CompareView data={msg.compareData} />
                    </div>
                  )}

                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-200 border border-slate-300 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 select-none shadow-sm uppercase">
                    {userName ? userName.charAt(0) : 'U'}
                  </div>
                )}

              </div>
            );
          })}

          {/* Empty Chat Chips */}
          {chatSession.messages.length === 1 && (
            <div className="max-w-xl mx-auto py-12 text-center space-y-6 select-none">
              <span className="text-[10px] bg-purple-50 text-purple-600 font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-purple-200 inline-block">
                Suggested doubt query chips
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {promptChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setInput(chip)}
                    className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-600 hover:text-slate-800 smooth-transition leading-normal"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isDebating && (
            <DebateProgress
              status={status}
              statusMessage={statusMessage}
              currentRound={currentRound}
              rounds={rounds}
              progress={progress}
              totalRounds={debateRounds}
              providers={debateProviders}
            />
          )}

          {isSending && (
            <div className="flex w-full gap-4 max-w-4xl mr-auto justify-start animate-fadeIn">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white text-xs shrink-0 select-none shadow-sm">
                AI
              </div>
              <div className="space-y-4 max-w-[90%] flex-1">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-xs font-medium leading-relaxed mr-auto shadow-sm flex items-center gap-3 w-fit">
                  <Loader variant="dots" size="sm" className="h-5" />
                  <span className="text-[10px] text-slate-400 font-semibold italic animate-pulse">BodhAI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Input Area Bar */}
        <footer className="p-4 border-t border-slate-200/80 bg-white shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto space-y-3">
            
            {/* Attachments Display */}
            {(attachedFiles.length > 0 || chatSession.attachments.length > 0) && (
              <div className="flex flex-wrap gap-2 items-center select-none">
                <span className="text-[9px] text-slate-450 font-bold uppercase tracking-wider mr-1">Attachments:</span>
                
                {[...chatSession.attachments, ...attachedFiles].map((file) => (
                  <div 
                    key={file} 
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600"
                  >
                    <FileCode className="w-3 h-3 text-cyan-600" />
                    <span>{file}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(file)}
                      className="text-slate-400 hover:text-slate-650 smooth-transition ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Shell */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:bg-white focus-within:border-purple-500/50 smooth-transition p-1.5 sm:p-2 gap-1.5 sm:gap-2 shadow-sm">
              
              <button
                type="button"
                onClick={handleAttachFile}
                title="Attach source file code"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center shrink-0 smooth-transition"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleSpeechToggle}
                title={isDictating ? 'Stop dictating' : 'Speak speech query'}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0 border smooth-transition ${
                  isDictating
                    ? 'bg-rose-500 border-rose-500 text-white animate-pulse'
                    : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isDictating ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsSetupModalOpen(true)}
                disabled={connectedProviders.length < 2 || isDebating}
                title={
                  connectedProviders.length < 2
                    ? 'AI Debate requires at least 2 active API keys. Configure them in Settings.'
                    : 'Start Multi-AI Debate'
                }
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 flex items-center justify-center shrink-0 smooth-transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="text-sm sm:text-base select-none">⚔️</span>
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isDictating ? 'Listening...' : 'Ask BodhAI a doubt or request compare...'}
                className="flex-1 bg-transparent px-1 sm:px-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none min-w-0"
              />

              <button
                type="submit"
                disabled={!input.trim() && attachedFiles.length === 0}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-105 text-white disabled:text-slate-400 flex items-center justify-center shrink-0 smooth-transition shadow-sm disabled:shadow-none"
              >
                <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
              </button>
            </div>
          </form>
        </footer>

      </div>
      <VoiceChatOverlay
        isOpen={isVoiceOverlayOpen}
        onClose={() => setIsVoiceOverlayOpen(false)}
        chatId={chatSession.id}
      />
      {isSetupModalOpen && (
        <DebateSetupModal
          connectedProviders={connectedProviders}
          initialQuestion={input}
          onStart={handleStartDebate}
          onClose={() => setIsSetupModalOpen(false)}
        />
      )}
    </div>
  );
}
