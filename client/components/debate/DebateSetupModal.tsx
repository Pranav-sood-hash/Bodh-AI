import React, { useState } from 'react';

export const PROVIDER_INFO: Record<string, {
  name: string;
  color: string;
  lightColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
  strength: string;
}> = {
  OPENAI: {
    name: 'OpenAI GPT-4o',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700',
    icon: '⚡',
    strength: 'Reasoning & Code'
  },
  ANTHROPIC: {
    name: 'Claude 3.5',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
    icon: '🎯',
    strength: 'Analysis & Nuance'
  },
  GEMINI: {
    name: 'Gemini 1.5 Pro',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    icon: '✦',
    strength: 'Creative & Broad'
  },
  GROQ: {
    name: 'Groq LLaMA',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    icon: '🚀',
    strength: 'Speed & Efficiency'
  },
  MISTRAL: {
    name: 'Mistral Large',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    textColor: 'text-yellow-700',
    icon: '🌊',
    strength: 'Balanced & Precise'
  }
};

interface DebateSetupModalProps {
  connectedProviders: string[];
  initialQuestion?: string;
  onStart: (params: { providers: string[]; rounds: number; mode: string; question: string }) => void;
  onClose: () => void;
}

export default function DebateSetupModal({
  connectedProviders,
  initialQuestion = '',
  onStart,
  onClose
}: DebateSetupModalProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [rounds, setRounds] = useState(3);
  const [mode] = useState('FREE_CHAT');

  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : prev.length < 4
          ? [...prev, provider]
          : prev
    );
  };

  const activeProviders = connectedProviders.filter(p => PROVIDER_INFO[p.toUpperCase()]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-2 select-none">⚔️</div>
          <h2 className="text-2xl font-bold text-slate-900">AI Debate Mode</h2>
          <p className="text-slate-500 text-sm mt-1">
            Multiple AIs debate your question and reach ONE consensus answer
          </p>
        </div>

        {/* How it works mini-explainer */}
        <div className="bg-slate-50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold text-slate-700">How it works:</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-600">
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-[11px] font-bold text-blue-700">
                1️⃣
              </div>
              <span className="text-center font-semibold">R1: Initial answers</span>
            </div>
            <div className="text-slate-350 text-xs">→</div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center text-[11px] font-bold text-orange-700">
                2️⃣
              </div>
              <span className="text-center font-semibold">R2: Read & critique</span>
            </div>
            <div className="text-slate-350 text-xs">→</div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-[11px] font-bold text-purple-700">
                3️⃣
              </div>
              <span className="text-center font-semibold">R3: Final revisions</span>
            </div>
            <div className="text-slate-350 text-xs">→</div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-[11px] font-bold text-green-700">
                ✅
              </div>
              <span className="text-center font-semibold">Synthesis: Consensus</span>
            </div>
          </div>
        </div>

        {/* Debate Question Text Area */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Debate Question
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question for the AIs to debate..."
            className="w-full border border-slate-205 rounded-xl p-3 text-xs focus:outline-none focus:border-blue-500 min-h-[80px] resize-none text-slate-800 font-medium"
          />
        </div>

        {/* Provider Selection */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-slate-700">Select Debaters</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                selectedProviders.length >= 2
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {selectedProviders.length}/4 selected (min 2)
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-1">
            {activeProviders.length === 0 ? (
              <p className="text-xs text-red-500 py-2">
                No supported providers have keys configured. Please add keys in Settings.
              </p>
            ) : (
              activeProviders.map(provider => {
                const normProvider = provider.toUpperCase();
                const info = PROVIDER_INFO[normProvider];
                const isSelected = selectedProviders.includes(normProvider);
                if (!info) return null;

                return (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => toggleProvider(normProvider)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all w-full ${
                      isSelected
                        ? `${info.borderColor} ${info.lightColor}`
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-white text-lg font-bold flex-shrink-0 ${info.color}`}
                    >
                      {info.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm">{info.name}</div>
                      <div className="text-xs text-slate-500">Best at: {info.strength}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? `${info.color} border-transparent` : 'border-slate-300'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" viewBox="0 0 12 12">
                          <path
                            fill="currentColor"
                            d="M9.707 3.293a1 1 0 0 0-1.414 0L5 6.586 3.707 5.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0 0-1.414z"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Rounds Selection */}
        <div className="mb-6">
          <span className="text-sm font-bold text-slate-700 block mb-3">Debate Rounds</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                roundsVal: 1,
                label: 'Quick',
                desc: '~1 min',
                detail: 'Initial answers only'
              },
              {
                roundsVal: 2,
                label: 'Standard',
                desc: '~3 min',
                detail: 'Initial + critiques'
              },
              {
                roundsVal: 3,
                label: 'Deep',
                desc: '~5 min',
                detail: '3-round debate mode',
                recommended: true
              }
            ].map(opt => (
              <button
                key={opt.roundsVal}
                type="button"
                onClick={() => setRounds(opt.roundsVal)}
                className={`p-3 rounded-xl border-2 text-center transition-all relative ${
                  rounds === opt.roundsVal ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {opt.recommended && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap uppercase tracking-wider">
                    Recommended
                  </div>
                )}
                <div className="font-bold text-slate-900 text-sm mt-1">{opt.label}</div>
                <div className="text-xs text-blue-600 font-semibold">{opt.desc}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{opt.detail}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-slate-300 rounded-xl py-3 text-slate-700 text-sm font-medium hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() =>
              onStart({
                providers: selectedProviders,
                rounds,
                mode,
                question
              })
            }
            disabled={selectedProviders.length < 2 || !question.trim()}
            className="flex-2 flex-grow-[2] bg-blue-600 text-white rounded-xl py-3 text-sm font-bold hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span>⚔️</span>
            Start Debate ({selectedProviders.length} AIs, {rounds} round{rounds > 1 ? 's' : ''})
          </button>
        </div>
      </div>
    </div>
  );
}
