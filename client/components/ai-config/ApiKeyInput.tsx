import React, { useState } from 'react';
import { Key, Eye, EyeOff, Clipboard } from 'lucide-react';

interface ApiKeyInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  label?: string;
  info?: string;
}

export default function ApiKeyInput({
  value,
  onChange,
  placeholder = 'Enter API Key',
  label,
  info
}: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error('Failed to read clipboard', err);
    }
  };

  return (
    <div className="space-y-2 w-full text-slate-200">
      {label && (
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
          {label}
        </label>
      )}
      <div className="relative flex items-center rounded-xl bg-slate-950 border border-slate-800/80 focus-within:border-purple-500/50 focus-within:ring-1 focus-within:ring-purple-500/30 smooth-transition overflow-hidden">
        <div className="pl-4 text-slate-500 shrink-0">
          <Key className="w-4 h-4" />
        </div>
        <input
          type={showKey ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent px-3 py-3.5 text-xs text-slate-200 font-mono placeholder-slate-600 focus:outline-none"
        />
        <div className="flex items-center pr-3 gap-1 shrink-0 border-l border-white/5 pl-2">
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="p-1.5 text-slate-500 hover:text-purple-400 rounded-lg hover:bg-white/5 smooth-transition"
            title={showKey ? 'Hide key' : 'Show key'}
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handlePaste}
            className="p-1.5 text-slate-500 hover:text-purple-400 rounded-lg hover:bg-white/5 smooth-transition flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider"
            title="Paste from clipboard"
          >
            <Clipboard className="w-4 h-4" />
            <span className="hidden sm:inline">Paste</span>
          </button>
        </div>
      </div>
      {info && (
        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed flex items-center gap-1 mt-1">
          <span>ℹ</span> {info}
        </p>
      )}
    </div>
  );
}
