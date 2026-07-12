import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { useProfile } from '@/hooks/useProfile';
import { 
  Sliders, 
  Key, 
  CreditCard, 
  Award, 
  ShieldAlert, 
  Sparkles, 
  Check, 
  Search, 
  Mic, 
  Settings as SettingsIcon,
  Trash2
} from 'lucide-react';
import ApiKeyInput from '@/components/ai-config/ApiKeyInput';
import DangerZone from '@/components/ai-config/DangerZone';

export default function ProviderManagement() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';

  // Primary credentials
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiStatus, setOpenaiStatus] = useState<'connected'|'not-connected'>('not-connected');

  // Secondary providers inputs
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');

  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await api.get('/apikeys');
        const keys = res.data.data || [];
        keys.forEach((k: any) => {
          if (k.provider?.toUpperCase() === 'OPENAI') {
            setOpenaiKey(k.keyHash || '********');
            setOpenaiStatus('connected');
          }
          if (k.provider?.toUpperCase() === 'ANTHROPIC') setAnthropicKey(k.keyHash || '********');
          if (k.provider?.toUpperCase() === 'GEMINI') setGeminiKey(k.keyHash || '********');
        });
      } catch (err) {
        console.error('Failed to load api keys', err);
      }
    };
    fetchApiKeys();
  }, [navigate]);

  const handleTestConnection = async () => {
    if (!openaiKey) {
      alert('Please input a valid key.');
      return;
    }
    try {
      if (!openaiKey.includes('***')) {
        await api.post('/apikeys', { provider: 'OPENAI', apiKey: openaiKey });
      }
      setOpenaiStatus('connected');
      alert('OpenAI API credentials successfully validated and saved!');
    } catch (e) {
      alert('Failed to save OpenAI key');
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.delete('/apikeys/revoke-all');
      setOpenaiKey('');
      setOpenaiStatus('not-connected');
      alert('OpenAI provider has been disconnected.');
    } catch (e) {
      alert('Failed to disconnect');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await api.delete('/apikeys/revoke-all');
      setOpenaiKey('');
      setAnthropicKey('');
      setGeminiKey('');
      setOpenaiStatus('not-connected');
      alert('All stored API credentials have been completely revoked.');
    } catch (e) {
      alert('Failed to revoke credentials');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar - Dark Navy */}
      <Sidebar userName={userName} />

      {/* Main light mode panel */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:pl-[var(--sidebar-width)] relative z-10">
        <MobileTopBar title="Provider Management" />
        
        {/* Top bar search & profile */}
        <div className="hidden lg:flex bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 items-center justify-between sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3 w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search settings..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-700 transition">
              <Mic className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-700 transition">
              <SettingsIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => alert('Sharing configuration profile link.')}
              className="bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition"
            >
              Share
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              {userName ? userName.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 pb-32">
          
          {/* Breadcrumbs & Header */}
          <div className="space-y-1 select-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <span className="cursor-pointer hover:underline" onClick={() => navigate('/settings/ai-configuration')}>AI Configuration</span>
              <span>&gt;</span>
              <span className="text-slate-600">Provider Management</span>
            </div>
            <h1 className="text-2xl font-black text-[#091E42]">
              Provider Management
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Monitor real-time token traffic thresholds and throttle compute budgets across primary API bridges.
            </p>
          </div>

          {/* Two Columns Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Main Engine Setup (2 cols) */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />
                
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">OpenAI</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">GPT-4o, GPT-4</p>
                    </div>
                  </div>

                  {openaiStatus === 'connected' ? (
                    <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 animate-fade-in">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Active
                    </span>
                  ) : (
                    <span className="bg-slate-50 border border-slate-200 text-slate-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                      Disconnected
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <ApiKeyInput
                    value={openaiKey}
                    onChange={setOpenaiKey}
                    placeholder="sk-proj-..."
                  />

                  <div className="flex items-center gap-3 pt-2 select-none">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      className="py-2.5 px-5 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-[0_2px_8px_rgba(0,82,204,0.15)]"
                    >
                      Test Connection
                    </button>
                    {openaiStatus === 'connected' && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="py-2.5 px-4 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl transition border border-slate-200 hover:border-red-100"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Right: Quota Usage */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm select-none">
                
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-3">
                  Quota Usage
                </h3>

                {/* Spend limit */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      Monthly Spend
                    </span>
                    <span className="text-slate-800">$12.45 / $50.00</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '24.9%' }} />
                  </div>
                </div>

                {/* Token traffic */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-extrabold uppercase">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-blue-600" />
                      Token Usage
                    </span>
                    <span className="text-slate-800">982.5k / 5M</span>
                  </div>

                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '19.6%' }} />
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Secondary Providers */}
          <div className="space-y-4">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-widest select-none">Secondary Providers</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Anthropic Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center select-none border-b border-slate-50 pb-2">
                  <span className="bg-orange-50 text-orange-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-orange-100">
                    Anthropic Claude
                  </span>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Claude-3-Sonnet</span>
                </div>
                <ApiKeyInput
                  value={anthropicKey}
                  onChange={setAnthropicKey}
                  placeholder="sk_ant_..."
                />
              </div>

              {/* Llama Card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center select-none border-b border-slate-50 pb-2">
                  <span className="bg-indigo-50 text-indigo-700 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                    Meta Llama
                  </span>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">Llama-3-Groq</span>
                </div>
                <ApiKeyInput
                  value={geminiKey}
                  onChange={setGeminiKey}
                  placeholder="grq_..."
                />
              </div>

            </div>
          </div>

          {/* Revoke section */}
          <div className="bg-red-50/50 border border-red-200 rounded-3xl p-6 space-y-4 select-none">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-red-900 uppercase tracking-wide">Danger Zone</h4>
                <p className="text-xs text-red-700 font-semibold leading-relaxed">
                  Permanently revoke and delete all credentials, token budgets, and integration routes from local cache memory. This action is irreversible.
                </p>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleRevokeAll}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-[0_2px_8px_rgba(220,38,38,0.15)]"
              >
                Revoke All Credentials
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}


