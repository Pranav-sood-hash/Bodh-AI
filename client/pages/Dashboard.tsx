import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { 
  Flame, 
  BookOpen, 
  Sparkles, 
  Map, 
  Wrench, 
  Compass,
  ArrowRight,
  TrendingUp,
  Search,
  Mic,
  Settings as SettingsIcon,
  Loader2
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useProfile } from '@/hooks/useProfile';
import { useProgress } from '@/hooks/useProgress';
import { useRoadmap } from '@/hooks/useRoadmap';

import OnboardingModal from '@/components/modals/OnboardingModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { chats } = useChat();
  const { profile, stats, isLoading: profileLoading, saveOnboarding } = useProfile();
  const { progress, isLoading: progressLoading } = useProgress();
  const { roadmap, isLoading: roadmapLoading, generateRoadmap } = useRoadmap();
  
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  useEffect(() => {
    if (profile && profile.onboardingDone === false && !profileLoading) {
      setIsOnboardingOpen(true);
    }
  }, [profile, profileLoading]);

  const handleSaveOnboarding = async (data: { goal: string; level: string; hours: number }) => {
    try {
      let mappedLevel = 'intermediate';
      if (data.level === 'Beginner') mappedLevel = 'beginner';
      else if (data.level === 'Expert') mappedLevel = 'advanced';

      await saveOnboarding({
        goal: data.goal,
        level: mappedLevel,
        topics: [data.goal]
      });
      setIsOnboardingOpen(false);
    } catch (err) {
      console.error('Failed to save onboarding:', err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';
  const initial = userName ? userName.charAt(0).toUpperCase() : 'U';

  const renderStats = () => {
    if (progressLoading || profileLoading) {
      return <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-blue-500" /></div>;
    }

    const defaultStats = [
      { label: 'Learning Streak', val: `${profile?.dayStreak || 0} Days Active`, color: 'text-orange-600', pct: Math.min((profile?.dayStreak || 0) * 10, 100), desc: `Top ${Math.max(100 - (profile?.dayStreak || 0)*2, 1)}% of cohort` },
      { label: 'Cognitive Mastery', val: `${progress?.topicMastery?.length || 0} Topics`, color: 'text-purple-600', pct: Math.min((progress?.topicMastery?.length || 0) * 5, 100), desc: `Calculated across ${roadmap?.milestones?.length || 0} milestones` },
      { label: 'Attention Focus Index', val: `${profile?.hoursStudied || 0} Hours Total`, color: 'text-blue-600', pct: Math.min((profile?.hoursStudied || 0) * 2, 100), desc: 'Deep work focus metrics' },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {defaultStats.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200/80 rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center select-none">
              <span className="text-xs text-slate-500 font-semibold">{stat.label}</span>
              <span className={`text-xs font-extrabold ${stat.color}`}>{stat.val}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r from-blue-500 to-purple-600`}
                style={{ width: `${stat.pct}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-semibold leading-none uppercase select-none">{stat.desc}</p>
          </div>
        ))}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (roadmapLoading) {
      return <div className="p-4 text-center text-sm text-slate-500">Loading recommendations...</div>;
    }

    if (!roadmap || !roadmap.milestones || roadmap.milestones.length === 0) {
      return (
        <div className="p-4 text-center">
          <Map className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium mb-3">No roadmap yet</p>
          <button 
            onClick={() => generateRoadmap({ goal: profile?.goal || 'General' })}
            className="text-xs font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Generate My Roadmap
          </button>
        </div>
      );
    }

    const nextMilestone = roadmap.milestones.find((m: any) => m.status === 'IN_PROGRESS' || m.status === 'UPCOMING');

    return (
      <div className="space-y-3">
        {nextMilestone ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200/60 gap-3">
            <div>
              <span className="text-[9px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200 mb-1.5 inline-block select-none">
                Roadmap Milestone
              </span>
              <h4 className="text-xs font-bold text-slate-800">{nextMilestone.title}</h4>
              <p className="text-[11px] text-slate-500 font-medium mt-1">{nextMilestone.description || 'Continue your learning journey.'}</p>
            </div>
            <button 
              onClick={() => navigate('/roadmap')}
              className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 hover:text-blue-700 smooth-transition whitespace-nowrap self-start sm:self-center"
            >
              Resolve →
            </button>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-slate-500">You have completed all milestones!</div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      <Sidebar userName={userName} />

      <main className="flex-1 min-w-0 overflow-y-auto pl-0 lg:pl-56 relative z-10 transition-all duration-300">
        <div className="bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-30 select-none">
          <div className="flex items-center gap-3 w-full md:w-96 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search curriculum or doubts..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4 ml-4">
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
              {initial}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-10">
          
          <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex flex-col justify-between min-h-[220px] shadow-md">
            <div className="space-y-3 z-10">
              <span className="text-[10px] bg-white/20 text-white font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/25 inline-block">
                Focus Core
              </span>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
                Focus your mind.<br />What are we mastering today?
              </h1>
              <p className="text-xs text-blue-100 font-medium max-w-xl">
                Select your parameters in the sidebar or active roadmaps. BodhAI monitors cognitive logs offline to adjust real-time workloads.
              </p>
            </div>

            {profile && (
              <div className="mt-6 flex flex-wrap gap-2 md:gap-4 items-center text-xs border-t border-white/10 pt-4 z-10">
                <span className="text-blue-200 font-bold uppercase tracking-wider hidden md:inline">Active Curriculum:</span>
                <span className="bg-white/10 text-white font-bold px-3 py-1.5 rounded-lg border border-white/10">
                  🎯 {profile.goal || 'General'}
                </span>
                <span className="bg-white/10 text-white font-bold px-3 py-1.5 rounded-lg border border-white/10">
                  ⚡ {profile.level || 'Beginner'} Experience
                </span>
                <button
                  onClick={() => setIsOnboardingOpen(true)}
                  className="text-[10px] text-white bg-white/20 hover:bg-white/30 font-extrabold uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-lg md:ml-auto smooth-transition mt-2 md:mt-0"
                >
                  Adjust Goals
                </button>
              </div>
            )}
            
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-60 h-60 bg-blue-500/35 rounded-full blur-2xl pointer-events-none" />
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 flex flex-col justify-between h-48 hover:border-purple-500/30 hover:shadow-md smooth-transition group">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Resume Last Session</h3>
                <p className="text-xs text-slate-500 font-medium">Jump right back into your last learning session or chat.</p>
              </div>
              <button 
                onClick={() => {
                  if (chats && chats.length > 0) {
                    navigate(`/chat/${chats[0].id}`);
                  } else {
                    navigate('/chat/new');
                  }
                }}
                className="text-xs text-purple-600 font-extrabold uppercase tracking-wider flex items-center gap-1 group-hover:text-purple-700 smooth-transition self-start"
              >
                Go to Workspace <ArrowRight className="w-3 h-3 group-hover:translate-x-1 smooth-transition" />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 flex flex-col justify-between h-48 hover:border-cyan-500/30 hover:shadow-md smooth-transition group">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <Map className="w-4 h-4 text-cyan-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Study Roadmap</h3>
                <p className="text-xs text-slate-500 font-medium">Verify milestone completion progress for your goals.</p>
              </div>
              <button 
                onClick={() => navigate('/roadmap')}
                className="text-xs text-cyan-600 font-extrabold uppercase tracking-wider flex items-center gap-1 group-hover:text-cyan-700 smooth-transition self-start"
              >
                Open Pathway <ArrowRight className="w-3 h-3 group-hover:translate-x-1 smooth-transition" />
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 flex flex-col justify-between h-48 hover:border-pink-500/30 hover:shadow-md smooth-transition group">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-lg bg-pink-50 flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-pink-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Project Builder</h3>
                <p className="text-xs text-slate-500 font-medium">Synthesize high-tier practical scripts using AI mentor support.</p>
              </div>
              <button 
                onClick={() => navigate('/projects')}
                className="text-xs text-pink-600 font-extrabold uppercase tracking-wider flex items-center gap-1 group-hover:text-pink-700 smooth-transition self-start"
              >
                Inspect Tasks <ArrowRight className="w-3 h-3 group-hover:translate-x-1 smooth-transition" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-black text-[#091E42] tracking-wide flex items-center gap-2 select-none">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Continuous Mind Analytics
            </h2>
            {renderStats()}
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between select-none">
              <h3 className="text-sm font-extrabold text-slate-800 tracking-wide flex items-center gap-2">
                <Compass className="w-4 h-4 text-purple-600" />
                Curated AI Recommendations
              </h3>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">Calculated Just Now</span>
            </div>
            {renderRecommendations()}
          </div>

        </div>

      </main>

      {isOnboardingOpen && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onSave={handleSaveOnboarding}
        />
      )}

    </div>
  );
}
