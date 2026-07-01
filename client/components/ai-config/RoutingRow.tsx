import React, { useState, useRef, useEffect } from 'react';
import { Brain, Code, FileText, ChevronDown, Check, Plus, Sparkles } from 'lucide-react';

export interface ProviderOption {
  id: string;
  name: string;
  desc: string;
  icon: 'openai' | 'cohere' | 'groq' | 'anthropic' | 'gemini';
  connected: boolean;
}

interface RoutingRowProps {
  featureId: string;
  title: string;
  desc: string;
  iconType: 'learning' | 'code' | 'document' | 'search';
  currentProviderId: string;
  connectedProviders: ProviderOption[];
  onRouteChanged: (providerId: string) => void;
  onConnectNew?: () => void;
}

export default function RoutingRow({
  featureId,
  title,
  desc,
  iconType,
  currentProviderId,
  connectedProviders,
  onRouteChanged,
  onConnectNew
}: RoutingRowProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeProvider = connectedProviders.find(p => p.id === currentProviderId) || {
    id: 'openai-gpt-4o',
    name: 'OpenAI GPT-4o',
    icon: 'openai' as const,
    connected: true
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderFeatureIcon = () => {
    const iconClass = "w-5 h-5 text-purple-300";
    switch (iconType) {
      case 'learning':
        return <Brain className={iconClass} />;
      case 'code':
        return <Code className={iconClass} />;
      case 'document':
        return <FileText className={iconClass} />;
      case 'search':
        return <Sparkles className={iconClass} />;
      default:
        return <Brain className={iconClass} />;
    }
  };

  return (
    <div 
      className={`p-4 rounded-xl border smooth-transition flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isOpen 
          ? 'border-purple-500/40 bg-purple-950/5 shadow-[0_4px_20px_rgba(168,85,247,0.06)]' 
          : 'border-white/5 bg-slate-900/10 hover:bg-slate-900/20'
      }`}
    >
      {/* Feature details (Left side) */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-slate-950/80 border border-white/5 flex items-center justify-center shrink-0">
          {renderFeatureIcon()}
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-200">{title}</h4>
          <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{desc}</p>
        </div>
      </div>

      {/* Routing controls & Dropdown (Right side) */}
      <div className="relative flex items-center gap-3 self-end md:self-auto" ref={dropdownRef}>
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">Route to:</span>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider smooth-transition border ${
            isOpen
              ? 'border-purple-500 bg-purple-950/20 text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              : 'border-white/5 bg-slate-950 text-slate-400 hover:text-slate-200 hover:border-white/10'
          }`}
        >
          <span>{activeProvider.name}</span>
          <ChevronDown className={`w-3.5 h-3.5 smooth-transition ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-950/95 border border-white/10 rounded-2xl p-2 shadow-2xl z-50 backdrop-blur-xl animate-fade-in select-none">
            <span className="block text-[8px] font-extrabold tracking-widest text-slate-500 uppercase px-3 py-2 border-b border-white/5 mb-1">
              Connected Providers
            </span>
            
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
              {connectedProviders.map((option) => {
                const isSelected = option.id === currentProviderId;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onRouteChanged(option.id);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl smooth-transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-purple-500/10 border border-purple-500/20 text-purple-300'
                        : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <h5 className="text-[11px] font-bold">{option.name}</h5>
                      <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-none">{option.desc}</p>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-purple-400 shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>

            {onConnectNew && (
              <div className="mt-1 pt-1 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    onConnectNew();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider text-purple-400 hover:text-purple-300 hover:bg-white/5 smooth-transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  Connect New Provider
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
