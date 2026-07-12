import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { useProfile } from '@/hooks/useProfile';
import { 
  Sliders, 
  Key, 
  Shield, 
  HelpCircle, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  Check, 
  Save, 
  Search,
  Mic,
  Settings as SettingsIcon,
  ChevronRight,
  TrendingUp,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Play
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import ApiKeyInput from '@/components/ai-config/ApiKeyInput';

export default function AIConfiguration() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'detailed'>('overview');

  // Input states stored locally for a live high-fidelity feel
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [cohereKey, setCohereKey] = useState('');
  
  // Toggles & Switches
  const [dynamicSwitching, setDynamicSwitching] = useState(true);
  const [cohereActive, setCohereActive] = useState(true);
  const [groqActive, setGroqActive] = useState(true);

  // Key Security Parameters
  const [forceHttps, setForceHttps] = useState(true);
  const [ephemeralContext, setEphemeralContext] = useState(true);
  const [strictCostCaps, setStrictCostCaps] = useState(false);
  const [debugLogging, setDebugLogging] = useState(false);

  // Routing choices (connected list)
  const [primaryReasoningRoute, setPrimaryReasoningRoute] = useState('openai');

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
          if (k.provider?.toUpperCase() === 'OPENAI') setOpenaiKey(k.keyHash || '********');
          if (k.provider?.toUpperCase() === 'ANTHROPIC') setAnthropicKey(k.keyHash || '********');
          if (k.provider?.toUpperCase() === 'GEMINI') setGeminiKey(k.keyHash || '********');
          if (k.provider?.toUpperCase() === 'COHERE') setCohereKey(k.keyHash || '********');
        });
      } catch (err) {
        console.error('Failed to load api keys', err);
      }
    };
    fetchApiKeys();
  }, [navigate]);

  const handleSave = async () => {
    try {
      if (openaiKey && !openaiKey.includes('***')) await api.post('/apikeys', { provider: 'OPENAI', apiKey: openaiKey });
      if (anthropicKey && !anthropicKey.includes('***')) await api.post('/apikeys', { provider: 'ANTHROPIC', apiKey: anthropicKey });
      if (geminiKey && !geminiKey.includes('***')) await api.post('/apikeys', { provider: 'GEMINI', apiKey: geminiKey });
      if (cohereKey && !cohereKey.includes('***')) await api.post('/apikeys', { provider: 'COHERE', apiKey: cohereKey });
      alert('AI Orchestration configuration applied and synced successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save configuration');
    }
  };

  const handleReset = () => {
    setOpenaiKey('sk-proj-7x92...');
    setAnthropicKey('');
    setGeminiKey('');
    setCohereKey('');
    setDynamicSwitching(true);
    setCohereActive(true);
    setGroqActive(true);
    setForceHttps(true);
    setEphemeralContext(true);
    setStrictCostCaps(false);
    setDebugLogging(false);
    alert('Configuration reset to safe system defaults.');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar - Dark Navy */}
      <Sidebar userName={userName} />

      {/* Main light mode panel */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:pl-[var(--sidebar-width)] relative z-10">
        <MobileTopBar title="AI Configuration" />
        
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <span>AI Configuration</span>
                <span>&gt;</span>
                <span className="text-slate-600">{activeSubTab === 'overview' ? 'Primary Model Config' : 'AI Engine Orchestration'}</span>
              </div>
              <h1 className="text-2xl font-black text-[#091E42]">
                {activeSubTab === 'overview' ? 'Primary Model Configuration' : 'AI Engine Orchestration'}
              </h1>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {activeSubTab === 'overview' 
                  ? 'Configure task routing parameters and model priority states.' 
                  : 'Manage local keys, encryption envelopes, and outbound security.'}
              </p>
            </div>

            {/* Subtab toggle slider */}
            <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-fit overflow-x-auto scrollbar-none">
              <div className="flex gap-1 min-w-max w-full">
                <button
                  onClick={() => setActiveSubTab('overview')}
                  className={`flex-1 text-center px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                    activeSubTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Primary Model Config
                </button>
                <button
                  onClick={() => setActiveSubTab('detailed')}
                  className={`flex-1 text-center px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
                    activeSubTab === 'detailed' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  AI Engine Orchestration
                </button>
              </div>
            </div>
          </div>

          {/* ACTIVE TAB: Overview Console (preview (8).webp) */}
          {activeSubTab === 'overview' ? (
            <div className="space-y-8 animate-fade-in">
              
              {/* Top Row Stat Widgets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
                {/* Stat 1 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Total Requests</span>
                    <TrendingUp className="w-4 h-4 text-[#0052CC]" />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900">1,240</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold ml-2">↑ 12% this week</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Tokens Consumed</span>
                    <Layers className="w-4 h-4 text-[#0052CC]" />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900">2.4M</span>
                    <span className="text-[10px] text-slate-500 font-extrabold ml-2">Estimated $42.12 spent</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Active Providers</span>
                    <Cpu className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <span className="text-3xl font-black text-slate-900">5</span>
                    <span className="text-[10px] text-emerald-600 font-extrabold ml-2">Status: Operational</span>
                  </div>
                </div>
              </div>

              {/* Primary Model Configuration Cards */}
              <div className="space-y-4">
                <div className="flex justify-between items-center select-none">
                  <div>
                    <h3 className="text-sm font-bold text-[#091E42] uppercase tracking-wide">Primary Model Configuration</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Select the foundational engine for your BodhAI experience.</p>
                  </div>
                  <button 
                    onClick={() => setActiveSubTab('detailed')}
                    className="text-xs font-bold text-[#0052CC] hover:underline uppercase tracking-wider"
                  >
                    Manage API Keys
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none">
                  {/* OpenAI Card */}
                  <div className="bg-white border-2 border-blue-600 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-40 relative">
                    <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                      Active Primary
                    </div>
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-lg text-emerald-600 border border-slate-100">
                        O
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">OpenAI</span>
                        <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">GPT-4o, GPT-4 Turbo, GPT-3.5</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </div>
                  </div>

                  {/* Anthropic Card */}
                  <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-40 transition">
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-lg text-amber-600 border border-slate-100">
                        A
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Anthropic</span>
                        <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">Claude 3.5 Sonnet, Claude 3 Opus</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </div>
                  </div>

                  {/* Google Card */}
                  <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-40 transition">
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-lg text-indigo-600 border border-slate-100">
                        G
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Google Gemini</span>
                        <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">Gemini 1.5 Pro, Gemini Flash</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </div>
                  </div>

                  {/* Cohere Card */}
                  <div className="bg-white border border-slate-200/80 hover:border-slate-300 rounded-2xl p-5 shadow-sm flex flex-col justify-between h-40 transition">
                    <div className="space-y-3">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-bold text-lg text-emerald-700 border border-slate-100">
                        C
                      </div>
                      <div>
                        <span className="text-sm font-bold text-slate-800 block">Cohere</span>
                        <span className="text-[10px] text-slate-400 font-semibold block leading-tight mt-0.5">Command R+ High-Reasoning</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Provider Switching */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm select-none">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#091E42] uppercase tracking-wide">Dynamic Provider Switching</h3>
                      <span className="bg-blue-100 text-blue-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Power User
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-xl">
                      Automatically switch between low-latency and high-reasoning models based on the complexity of your request.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">{dynamicSwitching ? 'ON' : 'OFF'}</span>
                    <Switch checked={dynamicSwitching} onCheckedChange={setDynamicSwitching} className="data-[state=checked]:bg-[#0052CC]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Card Cohere */}
                  <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-600">
                        CO
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Cohere</span>
                        <span className="text-[10px] text-slate-400 font-semibold leading-tight">Command R+ Assistant</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      CONNECTED
                    </div>
                  </div>

                  {/* Card Groq */}
                  <div className="border border-slate-200 bg-slate-50/50 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center font-bold text-slate-600">
                        GR
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Groq</span>
                        <span className="text-[10px] text-slate-400 font-semibold leading-tight">LPU Inference Engine</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-wider text-emerald-600">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      CONNECTED
                    </div>
                  </div>
                </div>
              </div>

              {/* Custom Semantic Routing */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-6 shadow-sm select-none">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-[#091E42] uppercase tracking-wide">Custom Semantic Routing</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Force specific tasks to use your preferred model regardless of global settings.</p>
                  </div>
                  <button 
                    onClick={() => navigate('/settings/ai-configuration/routing')}
                    className="bg-[#0A192F] hover:bg-[#122A4E] text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition flex items-center gap-1"
                  >
                    Add Route
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                        <th className="py-3 px-4">Request Category</th>
                        <th className="py-3 px-4">Assigned Model</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-bold">
                      <tr>
                        <td className="py-4 px-4 text-slate-800">Code Explanation</td>
                        <td className="py-4 px-4">
                          <span className="bg-blue-50 text-[#0052CC] text-[10px] px-2.5 py-1 rounded-lg">
                            OpenAI GPT-4o
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-600">Active</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 text-slate-800">Language Translation</td>
                        <td className="py-4 px-4">
                          <span className="bg-amber-50 text-amber-700 text-[10px] px-2.5 py-1 rounded-lg">
                            Claude 3.5 Sonnet
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-600">Active</td>
                      </tr>
                      <tr>
                        <td className="py-4 px-4 text-slate-800">Summary Generation</td>
                        <td className="py-4 px-4">
                          <span className="bg-purple-50 text-purple-700 text-[10px] px-2.5 py-1 rounded-lg">
                            Cohere Command R+
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-600">Active</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            // ACTIVE TAB: AI Engine Orchestration (preview (9).webp)
            <div className="space-y-8 animate-fade-in">
              
              {/* Info Security Shield alert */}
              <div className="bg-blue-50 border border-blue-200/80 rounded-2xl p-5 flex items-start gap-4 select-none">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide">End-to-End Key Encryption</h4>
                  <p className="text-[10px] text-blue-800 font-semibold leading-relaxed">
                    All API keys are encrypted at rest using AES-256 and are never stored in plaintext. They are injected into the runtime environment only during active inference sessions.
                  </p>
                </div>
              </div>

              {/* Primary Providers (Key inputs) */}
              <div className="space-y-4">
                <div className="flex justify-between items-center select-none">
                  <h3 className="text-sm font-bold text-[#091E42] uppercase tracking-wide">Primary Providers</h3>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">4 Providers Available</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  
                  {/* OpenAI key binder */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between min-h-48">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                          <span className="text-xs font-black text-slate-800">OpenAI</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg tracking-wider">
                          Managed
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Configuration Status</label>
                        <div className="text-xs text-slate-500 font-medium p-3 bg-slate-50 rounded-xl border border-slate-200">
                          Securely managed via backend environment (.env).
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Anthropic key binder */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between min-h-48">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                          <span className="text-xs font-black text-slate-800">Anthropic</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg tracking-wider">
                          Managed
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Configuration Status</label>
                        <div className="text-xs text-slate-500 font-medium p-3 bg-slate-50 rounded-xl border border-slate-200">
                          Securely managed via backend environment (.env).
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Google Gemini key binder */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between min-h-48">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start select-none">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                          <span className="text-xs font-black text-slate-800">Google Gemini</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg tracking-wider">
                          Managed
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Configuration Status</label>
                        <div className="text-xs text-slate-500 font-medium p-3 bg-slate-50 rounded-xl border border-slate-200">
                          Securely managed via backend environment (.env).
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cohere key binder */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between min-h-48">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start select-none">
                        <div className="flex items-start gap-2">
                          <span className="w-2.5 h-2.5 bg-slate-300 rounded-full" />
                          <span className="text-xs font-black text-slate-800">Cohere</span>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg tracking-wider">
                          Managed
                        </span>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider">Configuration Status</label>
                        <div className="text-xs text-slate-500 font-medium p-3 bg-slate-50 rounded-xl border border-slate-200">
                          Securely managed via backend environment (.env).
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Additional parameters split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Additional Providers list */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm select-none">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#091E42] uppercase tracking-widest">Additional Providers</h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase">Enable experimental or niche model support.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Cohere AI</span>
                        <span className="text-[10px] text-slate-400 font-semibold block leading-tight">Command R+ model support</span>
                      </div>
                      <Switch checked={cohereActive} onCheckedChange={setCohereActive} className="data-[state=checked]:bg-[#0052CC]" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Ollama / Local</span>
                        <span className="text-[10px] text-slate-400 font-semibold block leading-tight">Host: localhost:11434</span>
                      </div>
                      <Switch checked={groqActive} onCheckedChange={setGroqActive} className="data-[state=checked]:bg-[#0052CC]" />
                    </div>
                  </div>
                </div>

                {/* Feature AI Routing Selector dropdowns */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm select-none">
                  <div>
                    <h3 className="text-xs font-extrabold text-[#091E42] uppercase tracking-widest">Feature AI Routing</h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-semibold uppercase">Default orchestration for specific BodhAI modules.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-xs font-bold text-slate-800">Creative Writing</span>
                      <select
                        value={primaryReasoningRoute}
                        onChange={(e) => setPrimaryReasoningRoute(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-[10px] text-slate-700 font-extrabold uppercase focus:outline-none"
                      >
                        <option value="openai">Auto-select (Default)</option>
                        <option value="claude">Claude 3.5 Sonnet</option>
                      </select>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-800">Technical Analysis</span>
                      <select
                        className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-[10px] text-slate-700 font-extrabold uppercase focus:outline-none"
                      >
                        <option>Auto-select (Default)</option>
                        <option>OpenAI GPT-4o</option>
                      </select>
                    </div>
                  </div>
                </div>

              </div>

              {/* Usage overview empty state card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm select-none">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#091E42] uppercase tracking-wide">Usage Overview</h3>
                  <button 
                    onClick={() => alert('Refreshing billing token logs.')}
                    className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:underline"
                  >
                    🔄 Update Metrics
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50/50 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Tokens Processed</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">0</span>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Estimated Cost</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">$0.00</span>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Instances</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">0</span>
                  </div>
                  <div className="bg-slate-50/50 p-4 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Uptime</span>
                    <span className="text-lg font-black text-slate-900 mt-1 block">100%</span>
                  </div>
                </div>

                {/* Empty state dotted container */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center">
                  <Sliders className="w-8 h-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No usage data detected for the current billing cycle.</p>
                </div>
              </div>

              {/* Key Security Settings */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm select-none">
                <h3 className="text-sm font-bold text-[#091E42] uppercase tracking-wide">Key Security Settings</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={forceHttps}
                        onChange={(e) => setForceHttps(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Force HTTPS Injection</span>
                        <span className="text-[9px] text-slate-400 font-semibold block leading-tight mt-0.5">Always use secure tunnels for API calls.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ephemeralContext}
                        onChange={(e) => setEphemeralContext(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Ephemeral Context</span>
                        <span className="text-[9px] text-slate-400 font-semibold block leading-tight mt-0.5">Purge key from memory immediately after inference.</span>
                      </div>
                    </label>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={strictCostCaps}
                        onChange={(e) => setStrictCostCaps(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Strict Cost Caps</span>
                        <span className="text-[9px] text-slate-400 font-semibold block leading-tight mt-0.5">Suspend services if daily spend exceeds $5.00.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={debugLogging}
                        onChange={(e) => setDebugLogging(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-blue-600 bg-slate-100 border-slate-300 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">Debug Logging</span>
                        <span className="text-[9px] text-slate-400 font-semibold block leading-tight mt-0.5">Log API response metadata for troubleshooting.</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Sticky bottom save/discard bar in light mode */}
        <div className="fixed bottom-0 lg:left-[var(--sidebar-width)] left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 md:px-8 py-4 flex items-center justify-end gap-4 z-40 select-none">
          <button
            onClick={handleReset}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 smooth-transition uppercase tracking-wider"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#0A192F] hover:bg-[#122A4E] text-white text-xs font-bold uppercase tracking-wider rounded-xl smooth-transition shadow-[0_4px_10px_rgba(10,25,47,0.15)] active:scale-[0.98]"
          >
            Save Configuration
          </button>
        </div>

      </main>
    </div>
  );
}


