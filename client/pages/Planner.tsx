import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { Calendar, Plus, Clock, Brain, AlertCircle, Search, Mic, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { usePlanner } from '@/hooks/usePlanner';
import { useProfile } from '@/hooks/useProfile';

interface StudyBlock {
  id: string;
  time: string;
  topic: string;
  mode: string;
  duration: string;
}

export default function Planner() {
  const navigate = useNavigate();
  
  const { sessions, isLoading, createSession, isCreating } = usePlanner();
  const { profile } = useProfile();
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';

  const [newTopic, setNewTopic] = useState('');
  const [newTime, setNewTime] = useState('17:00 - 18:00');
  const [newMode, setNewMode] = useState('Study Mode');

  // Chart telemetry data
  const telemetryData = [
    { hour: '08:00', fatigue: 20, focus: 85, threshold: 70 },
    { hour: '10:00', fatigue: 35, focus: 90, threshold: 70 },
    { hour: '12:00', fatigue: 55, focus: 75, threshold: 70 },
    { hour: '14:00', fatigue: 40, focus: 80, threshold: 70 },
    { hour: '16:00', fatigue: 65, focus: 60, threshold: 70 },
    { hour: '18:00', fatigue: 75, focus: 45, threshold: 70 },
    { hour: '20:00', fatigue: 30, focus: 70, threshold: 70 },
  ];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;

    try {
      const [start] = newTime.split(' - ');
      await createSession({
        title: newTopic,
        type: newMode,
        startTime: start,
        endTime: newTime.split(' - ')[1] || start,
        date: new Date().toISOString().split('T')[0],
        duration: 60,
      });
      setNewTopic('');
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar userName={userName} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:pl-[var(--sidebar-width)] relative z-10">
        
        {/* Mobile top bar */}
        <MobileTopBar title="Productivity Planner" />

        {/* Desktop Top bar search & profile */}
        <div className="hidden lg:flex bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 items-center justify-between sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3 w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search curriculum or doubts..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-700 transition">
              <Mic className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 p-2 text-slate-500 hover:text-slate-700 transition"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white text-xs shadow-inner">
              {userName ? userName.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10">
          
          {/* Header */}
          <div className="space-y-2 select-none">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Schedule Optimization</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Productivity Planner
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-xl">
              Organize daily study blocks. The offline fatigue index maps optimal cognitive slots to prevent attention threshold exhaustion.
            </p>
          </div>

          {/* Upper Section: Add Block & Current Schedule */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Column 1: Add new block schedule form */}
            <div className="lg:col-span-1 rounded-xl border border-slate-200/80 bg-white p-6 space-y-6 shadow-sm">
              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block">Plan Next Block</span>
              
              <form onSubmit={handleAddBlock} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Focus Topic</label>
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    placeholder="e.g. Lambda calculus reductions"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-700 placeholder-slate-450 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="09:00 - 10:30">09:00 - 10:30</option>
                    <option value="11:00 - 12:00">11:00 - 12:00</option>
                    <option value="14:00 - 16:00">14:00 - 16:00</option>
                    <option value="17:00 - 18:00">17:00 - 18:00</option>
                    <option value="19:00 - 20:30">19:00 - 20:30</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Interactive Mode</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-xs text-slate-600 focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Study Mode">Study Mode</option>
                    <option value="Voice Assistant">Voice Assistant</option>
                    <option value="Code Helper">Code Helper</option>
                    <option value="Compare Mode">Compare Mode</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!newTopic.trim() || isCreating}
                  className="w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:bg-slate-100 text-white disabled:text-slate-400 text-xs font-bold uppercase tracking-wider smooth-transition shadow-sm disabled:shadow-none"
                >
                  {isCreating ? 'Adding...' : 'Confirm Block'}
                </button>
              </form>
            </div>

            {/* Column 2: Interactive list of blocks */}
            <div className="lg:col-span-2 space-y-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Today's Optimized Schedule</span>
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.length === 0 ? (
                    <div className="text-center p-6 text-sm text-slate-500 bg-white rounded-xl border border-slate-200">
                      No blocks scheduled yet. Create one on the left.
                    </div>
                  ) : (
                    sessions.map((b: any) => (
                  <div 
                    key={b.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-slate-200/80 bg-white shadow-sm gap-3 hover:border-purple-500/20 smooth-transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex flex-col items-center justify-center shrink-0 border border-purple-100 select-none text-[10px] font-bold text-purple-600">
                        <Clock className="w-3.5 h-3.5 mb-0.5 text-purple-400" />
                        {b.duration || 60}m
                      </div>
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded uppercase font-bold mr-2 inline-block">
                          {b.type || 'Study Mode'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{b.startTime} - {b.endTime}</span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1 leading-snug">{b.title}</h4>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate('/chat/new')}
                      className="text-[10px] text-purple-600 hover:text-purple-700 font-extrabold uppercase tracking-widest whitespace-nowrap self-end sm:self-center"
                    >
                      Start Block →
                    </button>
                  </div>
                ))
              )}
              </div>
            )}
          </div>
        </div>

          {/* Recharts Area Chart: Cognitive Fatigue and Focus Intensity Telemetry */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between select-none">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Cognitive Load Trend</h3>
              </div>
              <div className="flex gap-4 items-center text-[10px] font-bold">
                <span className="flex items-center gap-1 text-purple-600"><span className="w-2 h-2 rounded bg-purple-500" /> Fatigue Level</span>
                <span className="flex items-center gap-1 text-cyan-600"><span className="w-2 h-2 rounded bg-cyan-400" /> Focus Intensity</span>
              </div>
            </div>

            {/* Recharts container */}
            <div className="h-[250px] w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={telemetryData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorFatigue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c084fc" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#c084fc" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  
                  <XAxis 
                    dataKey="hour" 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  
                  <YAxis 
                    stroke="#64748b" 
                    fontSize={10} 
                    tickLine={false} 
                  />
                  
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      borderColor: '#cbd5e1',
                      borderRadius: '8px',
                      color: '#334155',
                      fontSize: '11px',
                    }} 
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="fatigue" 
                    name="Cognitive Fatigue" 
                    stroke="#c084fc" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorFatigue)" 
                  />
                  
                  <Area 
                    type="monotone" 
                    dataKey="focus" 
                    name="Focus Index" 
                    stroke="#22d3ee" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorFocus)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Fatigue Warning */}
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-purple-50 border border-purple-100 select-none">
              <AlertCircle className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-purple-700 font-medium leading-normal">
                Cognitive overload peaks at 18:00 (75% fatigue index). We suggest active practice scheduling before 14:00 or after 20:00 to optimize retention values.
              </p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}
