import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { useProfile } from '@/hooks/useProfile';
import { 
  Sliders, 
  HelpCircle, 
  RotateCcw, 
  Search, 
  Code, 
  FileText, 
  Check, 
  Plus, 
  Database, 
  Shield, 
  Save,
  Mic,
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Map,
  Calendar,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function FeatureRouting() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';

  // Expanded/Collapsed states
  const [isRoadmapExpanded, setIsRoadmapExpanded] = useState(true);
  const [isPlannerExpanded, setIsPlannerExpanded] = useState(false);
  const [isTrackerExpanded, setIsTrackerExpanded] = useState(false);

  // Active routing providers mapping
  const [roadmapProvider, setRoadmapProvider] = useState<'openai' | 'anthropic' | 'gemini'>('openai');
  const [plannerProvider, setPlannerProvider] = useState<'openai' | 'anthropic' | 'gemini'>('anthropic');
  const [trackerProvider, setTrackerProvider] = useState<'openai' | 'anthropic' | 'gemini'>('gemini');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSave = () => {
    alert('Model Orchestration feature routing rules successfully applied!');
  };

  const handleDiscard = () => {
    setRoadmapProvider('openai');
    setPlannerProvider('anthropic');
    setTrackerProvider('gemini');
    alert('Changes discarded.');
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar - Dark Navy */}
      <Sidebar userName={userName} />

      {/* Main light mode panel */}
      <main className="flex-1 min-w-0 overflow-y-auto pl-64 relative z-10">
        
        {/* Top bar search & profile */}
        <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 select-none">
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
        <div className="max-w-5xl mx-auto px-8 py-8 space-y-8 pb-32">
          
          {/* Breadcrumbs & Header */}
          <div className="space-y-1 select-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
              <span>AI Configuration</span>
              <span>&gt;</span>
              <span className="text-slate-600">Model Orchestration</span>
            </div>
            <h1 className="text-2xl font-black text-[#091E42]">
              Model Orchestration
            </h1>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
              Configure how BodhAI routes different tasks to specialized AI models. Optimize for speed, reasoning, or cost-efficiency.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left 1 Column: Left metrics widgets (Inference Speed & Data Scrubbing) */}
            <div className="space-y-6">
              
              {/* Card 1: Inference Speed */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 select-none relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg tracking-wider border border-slate-200">
                    Global
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Inference Speed</h3>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    Currently optimized for 150 tokens/sec across all active sessions.
                  </p>
                </div>
              </div>

              {/* Card 2: Data Scrubbing */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 select-none relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[8px] font-black uppercase rounded-lg tracking-wider border border-slate-200">
                    Privacy
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 leading-tight">Data Scrubbing</h3>
                  <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
                    PII detection active for all outbound requests to third-party providers.
                  </p>
                </div>
              </div>

            </div>

            {/* Right 2 Columns: Section 3: Feature Routing expanded capability rows */}
            <div className="lg:col-span-2">
              
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
                
                {/* Section Header */}
                <div className="flex items-center justify-between select-none border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-600">
                      <h3 className="text-sm font-black uppercase tracking-wider">Section 3: Feature Routing</h3>
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-500">Assign specific LLMs to platform capabilities.</p>
                  </div>
                </div>

                {/* Capability Rows list */}
                <div className="space-y-4">
                  
                  {/* Row 1: Roadmap Generation (Expanded in preview (6).webp) */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setIsRoadmapExpanded(!isRoadmapExpanded)}
                      className="w-full bg-slate-50/50 hover:bg-slate-50 px-5 py-4 flex items-center justify-between text-left select-none transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Map className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Capability</span>
                          <span className="text-xs font-black text-slate-900 block mt-1 leading-none">Roadmap Generation</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Currently Active</span>
                          <span className="text-[10px] font-extrabold text-blue-600 block mt-1 leading-none">
                            {roadmapProvider === 'openai' 
                              ? 'GPT-4o (OpenAI)' 
                              : roadmapProvider === 'anthropic' 
                              ? 'Claude 3.5 Sonnet' 
                              : 'Gemini 1.5 Pro'}
                          </span>
                        </div>
                        {isRoadmapExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Pre-opened Selection List */}
                    {isRoadmapExpanded && (
                      <div className="px-5 py-4 border-t border-slate-100 space-y-3 bg-white">
                        
                        {/* Option OpenAI */}
                        <div 
                          onClick={() => setRoadmapProvider('openai')}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition select-none ${
                            roadmapProvider === 'openai' 
                              ? 'border-blue-600 bg-blue-50/10' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                              O
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">OpenAI</span>
                              <span className="text-[9px] text-slate-400 font-semibold block leading-none mt-0.5">GPT-4o • Reasoning optimized</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            roadmapProvider === 'openai' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {roadmapProvider === 'openai' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Option Anthropic */}
                        <div 
                          onClick={() => setRoadmapProvider('anthropic')}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition select-none ${
                            roadmapProvider === 'anthropic' 
                              ? 'border-blue-600 bg-blue-50/10' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                              A
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Anthropic</span>
                              <span className="text-[9px] text-slate-400 font-semibold block leading-none mt-0.5">Claude 3.5 Sonnet • Creative & Nuanced</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            roadmapProvider === 'anthropic' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {roadmapProvider === 'anthropic' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Option Gemini */}
                        <div 
                          onClick={() => setRoadmapProvider('gemini')}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition select-none ${
                            roadmapProvider === 'gemini' 
                              ? 'border-blue-600 bg-blue-50/10' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-600">
                              G
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">Google DeepMind</span>
                              <span className="text-[9px] text-slate-400 font-semibold block leading-none mt-0.5">Gemini 1.5 Pro • Large Context Window</span>
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            roadmapProvider === 'gemini' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {roadmapProvider === 'gemini' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>

                  {/* Row 2: Study Planner */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setIsPlannerExpanded(!isPlannerExpanded)}
                      className="w-full bg-slate-50/50 hover:bg-slate-50 px-5 py-4 flex items-center justify-between text-left select-none transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Capability</span>
                          <span className="text-xs font-black text-slate-900 block mt-1 leading-none">Study Planner</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Currently Active</span>
                          <span className="text-[10px] font-extrabold text-slate-600 block mt-1 leading-none">
                            {plannerProvider === 'openai' 
                              ? 'GPT-4o (OpenAI)' 
                              : plannerProvider === 'anthropic' 
                              ? 'Claude 3.5 Sonnet' 
                              : 'Gemini 1.5 Pro'}
                          </span>
                        </div>
                        {isPlannerExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Pre-opened Selection List */}
                    {isPlannerExpanded && (
                      <div className="px-5 py-4 border-t border-slate-100 space-y-3 bg-white">
                        {/* Option Anthropic */}
                        <div 
                          onClick={() => setPlannerProvider('anthropic')}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition select-none ${
                            plannerProvider === 'anthropic' ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">Claude 3.5 Sonnet (Recommended)</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            plannerProvider === 'anthropic' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {plannerProvider === 'anthropic' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Option OpenAI */}
                        <div 
                          onClick={() => setPlannerProvider('openai')}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition select-none ${
                            plannerProvider === 'openai' ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">OpenAI GPT-4o</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            plannerProvider === 'openai' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {plannerProvider === 'openai' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 3: Progress Tracker */}
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setIsTrackerExpanded(!isTrackerExpanded)}
                      className="w-full bg-slate-50/50 hover:bg-slate-50 px-5 py-4 flex items-center justify-between text-left select-none transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Capability</span>
                          <span className="text-xs font-black text-slate-900 block mt-1 leading-none">Progress Tracker</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase block tracking-wider leading-none">Currently Active</span>
                          <span className="text-[10px] font-extrabold text-slate-600 block mt-1 leading-none">
                            {trackerProvider === 'openai' 
                              ? 'GPT-4o (OpenAI)' 
                              : trackerProvider === 'anthropic' 
                              ? 'Claude 3.5 Sonnet' 
                              : 'Gemini 1.5 Pro'}
                          </span>
                        </div>
                        {isTrackerExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {/* Pre-opened Selection List */}
                    {isTrackerExpanded && (
                      <div className="px-5 py-4 border-t border-slate-100 space-y-3 bg-white">
                        {/* Option Gemini */}
                        <div 
                          onClick={() => setTrackerProvider('gemini')}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition select-none ${
                            trackerProvider === 'gemini' ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">Gemini 1.5 Pro (Recommended)</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            trackerProvider === 'gemini' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {trackerProvider === 'gemini' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>

                        {/* Option OpenAI */}
                        <div 
                          onClick={() => setTrackerProvider('openai')}
                          className={`cursor-pointer rounded-xl border p-3 flex items-center justify-between transition select-none ${
                            trackerProvider === 'openai' ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-800">OpenAI GPT-4o</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            trackerProvider === 'openai' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {trackerProvider === 'openai' && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Sticky footer */}
        <div className="fixed bottom-0 left-64 right-0 border-t border-slate-200 bg-white/95 backdrop-blur-md px-8 py-4 flex items-center justify-end gap-4 z-40 select-none">
          <button
            onClick={handleDiscard}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 smooth-transition uppercase tracking-wider"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-[#0052CC] hover:bg-[#0747A6] text-white text-xs font-bold uppercase tracking-wider rounded-xl smooth-transition shadow-[0_4px_10px_rgba(0,82,204,0.15)] active:scale-[0.98]"
          >
            Save Routing Logic
          </button>
        </div>

      </main>
    </div>
  );
}
