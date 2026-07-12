import React from 'react';
import { useChat } from '@/context/ChatContext';
import { useNavigate } from 'react-router-dom';
import {
  Headphones,
  BookOpen,
  Code,
  Sliders,
  X
} from 'lucide-react';

interface TaskModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModeOption {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  description: string;
  color: string;
  comingSoon?: boolean;
}

export default function TaskModeSelector({ isOpen, onClose }: TaskModeSelectorProps) {
  const { createNewChat } = useChat();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const modeOptions: ModeOption[] = [
    {
      id: 'voice',
      label: 'Voice Assistant',
      icon: Headphones,
      description: 'Engage in fluid audio dialogue with Atlas, your interactive voice mentor.',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      id: 'study',
      label: 'Study Mode',
      icon: BookOpen,
      description: 'Ask deep technical questions, analyze notes, and deconstruct complex theories.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'code',
      label: 'Code Helper',
      icon: Code,
      description: 'Submit snippets, break down algorithms, and run code instantly in our interactive sandbox.',
      color: 'from-yellow-400 to-orange-500',
    },
    {
      id: 'compare',
      label: 'Compare Mode',
      icon: Sliders,
      description: 'Perform side-by-side conceptual architecture deconstructions (e.g. FP vs OOP).',
      color: 'from-emerald-400 to-teal-500',
    },
  ];

  const handleSelectMode = async (opt: ModeOption) => {
    if (opt.comingSoon) return;

    let title = '';
    switch (opt.id) {
      case 'voice':
        title = '🎙️ Voice: Speech session with Atlas';
        break;
      case 'study':
        title = '📚 Study: Technical Concepts Discussion';
        break;
      case 'code':
        title = '💻 Code: Dynamic Execution playground';
        break;
      case 'compare':
        title = '🧠 Compare: OOP vs FP Architecture';
        break;
    }

    try {
      const chatId = await createNewChat(title, opt.id as any);
      onClose();
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      
      {/* Modal Card */}
      <div 
        className="w-full max-w-3xl bg-slate-900/90 border border-white/10 rounded-2xl flex flex-col max-h-[90vh] shadow-2xl relative overflow-hidden"
        style={{
          boxShadow: '0 0 40px rgba(147, 51, 234, 0.15)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-wide">Select Learning Mode</h2>
            <p className="text-xs text-slate-400 mt-1">Configure your BodhAI mentor session alignment parameters</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-slate-100 smooth-transition border border-transparent hover:border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto scrollbar-thin">
          {modeOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.label}
                onClick={() => handleSelectMode(opt)}
                disabled={opt.comingSoon}
                className={`text-left rounded-xl p-5 border relative flex flex-col justify-between h-48 smooth-transition group ${
                  opt.comingSoon
                    ? 'border-white/5 bg-slate-950/20 cursor-not-allowed opacity-50'
                    : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-purple-500/40 hover:-translate-y-1'
                }`}
              >
                {/* Coming Soon Indicator Badge */}
                {opt.comingSoon && (
                  <div className="absolute top-4 right-4 bg-slate-800 text-[10px] text-slate-400 font-semibold uppercase px-2 py-0.5 rounded border border-white/10">
                    coming soon
                  </div>
                )}

                <div className="space-y-4">
                  {/* Glowing Icon Container */}
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${opt.color} p-0.5 shadow-md flex items-center justify-center shrink-0`}>
                    <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-slate-200 group-hover:scale-110 smooth-transition" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-100 tracking-wide">{opt.label}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-3">{opt.description}</p>
                  </div>
                </div>

                {!opt.comingSoon && (
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider group-hover:translate-x-1 smooth-transition mt-3">
                    Initialize Workspace →
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
