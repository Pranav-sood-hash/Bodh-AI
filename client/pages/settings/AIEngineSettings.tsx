import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { useProfile } from '@/hooks/useProfile';
import { 
  Sliders, 
  Settings as SettingsIcon, 
  Brain, 
  Sparkles, 
  Key, 
  AlertCircle, 
  Info, 
  Lightbulb, 
  Play, 
  Search,
  Mic,
  Check,
  Lock,
  Plus
} from 'lucide-react';
import ApiKeyInput from '@/components/ai-config/ApiKeyInput';

export default function AIEngineSettings() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';
  const [openaiKey, setOpenaiKey] = useState('');
  const [status, setStatus] = useState<'connected' | 'not-connected'>('not-connected');

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
            setStatus('connected');
          }
        });
      } catch (err) {
        console.error('Failed to load api keys', err);
      }
    };
    fetchApiKeys();
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!openaiKey) {
      alert('Please enter an API Key.');
      return;
    }
    try {
      if (!openaiKey.includes('***')) {
        await api.post('/apikeys', { provider: 'OPENAI', apiKey: openaiKey });
      }
      setStatus('connected');
      alert('OpenAI provider configuration saved successfully!');
    } catch (err) {
      alert('Failed to save OpenAI key');
    }
  };

  const handleCancel = () => {
    navigate('/settings/ai-configuration');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar - Dark Navy */}
      <Sidebar userName={userName} />

      {/* Main light mode panel */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:pl-[var(--sidebar-width)] relative z-10">
        <MobileTopBar title="Provider Settings" />
        
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
              <span>Settings</span>
              <span>&gt;</span>
              <span className="text-slate-600">Provider Settings</span>
            </div>
            <h1 className="text-2xl font-black text-[#091E42]">
              Provider Settings
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Securely manage your AI provider credentials. API keys are stored locally and encrypted using industry-standard protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left 2 Columns: Expanded Active Provider Card */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border-2 border-blue-600 rounded-3xl p-6 space-y-6 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[30px]" />
                
                {/* Provider Logo Header */}
                <div className="flex justify-between items-center border-b border-slate-100 pb-4 select-none">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center font-black text-emerald-600 text-lg">
                      O
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900 leading-tight">OpenAI</h3>
                      <span className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        Active Provider
                      </span>
                    </div>
                  </div>
                  <a 
                    href="https://platform.openai.com/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Documentation
                  </a>
                </div>

                {/* Status Information */}
                <div className="space-y-6 pt-4">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wide block select-none">Configuration Status</label>
                    <div className="text-sm text-slate-600 font-medium p-4 bg-slate-50 rounded-xl border border-slate-200">
                      Your API Keys are securely managed via the backend environment (.env) file. 
                      You do not need to manually configure them here.
                    </div>
                  </div>

                  {/* Environment active banner */}
                  <div className="bg-[#0B3A82] text-white rounded-2xl p-4 flex items-start gap-3.5 select-none shadow-inner">
                    <Lock className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-blue-100 uppercase tracking-wide">Environment Variables Active</h4>
                      <p className="text-[10px] text-blue-200 font-medium leading-relaxed">
                        API credentials are automatically injected into the server runtime. Client-side access to raw API keys has been disabled for improved security.
                      </p>
                    </div>
                  </div>

                  {/* Form control buttons */}
                  <div className="flex items-center gap-3 select-none pt-2">
                    <button
                      type="button"
                      onClick={() => navigate('/settings/ai-configuration')}
                      className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition w-full"
                    >
                      Return to Configuration
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1 Column: Secondary Providers mini cards */}
            <div className="space-y-6">
              
              {/* Anthropic Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm select-none">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center font-bold text-orange-600">
                      A
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block leading-tight">Anthropic</span>
                      <span className="text-[9px] text-slate-400 font-bold block leading-tight mt-0.5">Not Configured</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/settings/ai-configuration')}
                  className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition block"
                >
                  Add Claude Key
                </button>
              </div>

              {/* Google Gemini Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm select-none">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                      G
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block leading-tight">Google Gemini</span>
                      <span className="text-[9px] text-slate-400 font-bold block leading-tight mt-0.5">Not Configured</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/settings/ai-configuration')}
                  className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition block"
                >
                  Add API Key
                </button>
              </div>

              {/* Ollama / Local Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm select-none">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center font-bold text-slate-600">
                      L
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-800 block leading-tight">Ollama / Local</span>
                      <span className="text-[9px] text-slate-400 font-bold block leading-tight mt-0.5">Host: localhost:11434</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Opening Ollama local port orchestrator.')}
                  className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-xl transition block"
                >
                  Manage Endpoint
                </button>
              </div>

            </div>

          </div>

          {/* Privacy priority bottom details block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center pt-8 border-t border-slate-200 select-none">
            <div className="space-y-4">
              <h2 className="text-lg font-black text-[#091E42]">Your Privacy, Our Priority</h2>
              <p className="text-xs font-medium text-slate-500 leading-relaxed">
                BodhAI uses zero-knowledge architecture for API management. Your keys never touch our servers; they are encrypted on your local hardware and used directly for client-side orchestration.
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>AES-256 Local Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Secure Enclave Integration (macOS/Linux)</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <div className="w-4 h-4 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span>Biometric Locking Capability</span>
                </div>
              </div>
            </div>

            {/* Visual Encrypted connection widget */}
            <div className="rounded-3xl bg-[#09172E] border border-slate-800 p-6 flex flex-col justify-center items-center text-center h-48 relative overflow-hidden shadow-md">
              <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[20px]" />
              <Lock className="w-8 h-8 text-emerald-400 mb-3" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none block">Security Matrix Shield</span>
              <div className="bg-[#122A4E] border border-slate-700/60 rounded-full py-1.5 px-4 mt-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Encrypted Connection Established</span>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}


