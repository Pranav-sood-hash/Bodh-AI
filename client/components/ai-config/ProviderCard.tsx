import React from 'react';
import { Sliders, Sparkles, Brain, Zap, Settings as SettingsIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import ApiKeyInput from './ApiKeyInput';

interface ProviderCardProps {
  name: string;
  models: string;
  status: 'active-primary' | 'connected' | 'disconnected' | 'optional' | 'missing-key';
  iconType: 'openai' | 'cohere' | 'groq' | 'anthropic' | 'gemini';
  isActive?: boolean;
  recommended?: boolean;
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
  onToggleActive?: (active: boolean) => void;
  onConfigureClick?: () => void;
  getKeyUrl?: string;
}

export default function ProviderCard({
  name,
  models,
  status,
  iconType,
  isActive = false,
  recommended = false,
  apiKey = '',
  onApiKeyChange,
  onToggleActive,
  onConfigureClick,
  getKeyUrl
}: ProviderCardProps) {

  const renderIcon = () => {
    const iconClass = "w-6 h-6 text-purple-400";
    switch (iconType) {
      case 'openai':
        return <SettingsIcon className={`${iconClass} text-emerald-400`} />;
      case 'cohere':
        return <Zap className={`${iconClass} text-emerald-600`} />;
      case 'groq':
        return <Sliders className={`${iconClass} text-purple-400`} />;
      case 'anthropic':
        return <Brain className={`${iconClass} text-amber-400`} />;
      case 'gemini':
        return <Sparkles className={`${iconClass} text-indigo-400`} />;
      default:
        return <SettingsIcon className={iconClass} />;
    }
  };

  const getBgClass = () => {
    switch (iconType) {
      case 'openai': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'cohere': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'groq': return 'bg-purple-500/10 border-purple-500/20';
      case 'anthropic': return 'bg-amber-500/10 border-amber-500/20';
      case 'gemini': return 'bg-indigo-500/10 border-indigo-500/20';
      default: return 'bg-slate-800/10 border-slate-700/20';
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'active-primary':
        return (
          <span className="bg-green-500/20 text-green-300 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Active Primary
          </span>
        );
      case 'connected':
        return (
          <span className="text-green-400 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Connected
          </span>
        );
      case 'missing-key':
        return (
          <span className="bg-red-500/10 border border-red-500/20 text-red-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-red-400" />
            Missing Key
          </span>
        );
      case 'optional':
        return (
          <span className="text-slate-500 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-slate-600 rounded-full" />
            Optional
          </span>
        );
      default:
        return (
          <span className="text-slate-600 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-slate-700 rounded-full" />
            Not Connected
          </span>
        );
    }
  };

  return (
    <div className={`relative rounded-2xl border bg-slate-900/40 p-5 space-y-4 backdrop-blur-sm smooth-transition hover:border-white/10 ${
      isActive ? 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-slate-900/60' : 'border-white/5'
    }`}>
      {recommended && (
        <div className="absolute -top-2.5 right-4 bg-purple-600 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-[0_2px_10px_rgba(147,51,234,0.4)]">
          Recommended
        </div>
      )}

      {/* Header Info */}
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${getBgClass()}`}>
          {renderIcon()}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            {name}
          </h4>
          <p className="text-xs text-slate-400 font-semibold truncate mt-0.5">{models}</p>
        </div>
      </div>

      {/* API Key Input Option */}
      {onApiKeyChange && (
        <div className="pt-2">
          <ApiKeyInput
            value={apiKey}
            onChange={onApiKeyChange}
            placeholder={`Enter ${name} Key`}
            info={name === 'OpenAI' ? 'Stored locally inside your browser.' : undefined}
          />
          {getKeyUrl && (
            <a
              href={getKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-[10px] text-purple-400 hover:text-purple-300 font-bold tracking-wider uppercase mt-2 smooth-transition hover:underline"
            >
              Get API Key ↗
            </a>
          )}
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-white/5" />

      {/* Bottom status and triggers */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {renderStatusBadge()}
        </div>
        
        {onToggleActive && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
              {isActive ? 'Active' : 'Enable'}
            </span>
            <Switch
              checked={isActive}
              onCheckedChange={onToggleActive}
              className="data-[state=checked]:bg-purple-500 data-[state=unchecked]:bg-slate-800"
            />
          </div>
        )}

        {onConfigureClick && (
          <button
            type="button"
            onClick={onConfigureClick}
            className="text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-950/15 hover:bg-purple-950/30 border border-purple-500/20 rounded-xl px-3 py-1.5 smooth-transition uppercase tracking-wider"
          >
            Configure
          </button>
        )}
      </div>
    </div>
  );
}
