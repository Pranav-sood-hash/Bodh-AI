import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { useSettings } from '@/context/SettingsContext';
import { useProfile as useProfileHook } from '@/hooks/useProfile';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { useTranslation } from 'react-i18next';
import { Switch } from '@/components/ui/switch';
import {
  User, Shield, Bell, Mic, Globe, Check, Play, Clock, Search,
  BookOpen, Flame, Rocket, Timer, MapPin, Code, TrendingUp, Calendar,
  Loader2, Edit2
} from 'lucide-react';
import { Loader } from '@/components/ui/loader';

// Profile sub-components
import EditProfileModal from '@/components/profile/EditProfileModal';
import ChangePassword from '@/components/profile/ChangePassword';
import ConnectedAccounts from '@/components/profile/ConnectedAccounts';
import ActiveSessions from '@/components/profile/ActiveSessions';
import DangerZone from '@/components/profile/DangerZone';
import NotificationsTab from '@/components/profile/NotificationsTab';
import ProfileHero from '@/components/profile/ProfileHero';

type Tab = 'profile' | 'security' | 'notifications' | 'voice' | 'language';

export default function Settings() {
  const navigate = useNavigate();
  const { settings, setVoice, setSpeed, setLanguage, setAccent } = useSettings();
  const { profile: hookProfile } = useProfileHook();
  const { i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [mastery, setMastery] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [toast, setToast] = useState('');

  // Voice states
  const [masterVoiceControl, setMasterVoiceControl] = useState(true);
  const [autoReadResponses, setAutoReadResponses] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(true);
  const [currentAccent, setCurrentAccent] = useState('American English');
  const [selectedVoice, setSelectedVoice] = useState('Aria');

  // Language states
  const [displayLanguage, setDisplayLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiResponseMode, setAiResponseMode] = useState('Auto-detect');
  const [commentsLanguage, setCommentsLanguage] = useState('English (Default)');
  const [timezone, setTimezone] = useState('(UTC+5:30) Chennai, Kolkata, Mumbai, New Delhi');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [firstDayOfWeek, setFirstDayOfWeek] = useState('Monday');

  // Derive userName from hookProfile (real API) or local state
  const userName = hookProfile
    ? `${hookProfile.firstName} ${hookProfile.lastName}`
    : (profile ? `${profile.firstName} ${profile.lastName}` : '');

  useEffect(() => {
    const fetchSettingsData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) { navigate('/login'); return; }

        const results = await Promise.allSettled([
          api.get('/user/profile'),
          api.get('/user/stats'),
          api.get('/roadmap'),
          api.get('/projects'),
          api.get('/settings')
        ]);

        const [profRes, stRes, rmRes, projRes, setRes] = results;

        if (profRes.status === 'fulfilled') {
          const rawProfile = profRes.value.data.data;
          
          let joinedDate = 'Oct 2023';
          if (rawProfile?.createdAt) {
            try {
              const d = new Date(rawProfile.createdAt);
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              joinedDate = `${months[d.getMonth()]} ${d.getFullYear()}`;
            } catch (e) {
              console.warn(e);
            }
          }

          const mappedProfile = rawProfile ? {
            ...rawProfile,
            avatarUrl: rawProfile.avatar || '',
            learningGoal: rawProfile.goal || '',
            skillLevel: rawProfile.level ? rawProfile.level.charAt(0).toUpperCase() + rawProfile.level.slice(1) : '',
            topicsOfInterest: rawProfile.topics || [],
            joinedDate
          } : null;

          setProfile(mappedProfile);
        } else {
          console.error('Failed to load user profile:', profRes.reason);
        }

        if (stRes.status === 'fulfilled') {
          setStats(stRes.value.data.data);
        } else {
          console.error('Failed to load user stats:', stRes.reason);
        }

        if (rmRes.status === 'fulfilled' && rmRes.value.data.data) {
          const rm = rmRes.value.data.data;
          const milestones = (rm.milestones || []).map((m: any) => ({
            ...m,
            status: m.status ? m.status.toLowerCase() : 'upcoming',
            ...(m.status?.toLowerCase() === 'in_progress' && { status: 'active' }),
            ...(m.status?.toLowerCase() === 'locked' && { status: 'upcoming' })
          }));
          setRoadmap({
            ...rm,
            progress: rm.progress !== undefined ? rm.progress : (rm.overallProgress ?? 0),
            milestones
          });
        } else if (rmRes.status === 'rejected') {
          console.error('Failed to load roadmap:', rmRes.reason);
        }

        if (projRes.status === 'fulfilled') {
          const rawProjects = projRes.value.data.data?.projects || projRes.value.data.data || [];
          const mappedProjects = rawProjects.map((p: any) => ({
            ...p,
            image: p.coverImage || p.image,
            title: p.name || p.title,
            tech: p.techStack || p.tech || [],
            status: p.status === 'COMPLETED' ? 'Completed' :
                    p.status === 'IN_PROGRESS' ? 'In Progress' :
                    p.status === 'PLANNING' ? 'Planning' :
                    p.status === 'IN_REVIEW' ? 'In Review' : (p.status || 'Planning')
          }));
          setProjects(mappedProjects);
        } else {
          console.error('Failed to load projects:', projRes.reason);
        }

        if (setRes.status === 'fulfilled') {
          const s = setRes.value.data.data || {};
          const getLanguageCode = (val: string): string => {
            if (!val) return 'en';
            const clean = val.trim().toLowerCase();
            const matched = SUPPORTED_LANGUAGES.find(
              l => l.code === clean || l.name.toLowerCase() === clean || l.nativeName.toLowerCase() === clean
            );
            return matched ? matched.code : 'en';
          };
          setDisplayLanguage(getLanguageCode(s.language || 'en'));
          setAiResponseMode(s.aiResponseLang || 'Auto-detect');
          setTimezone(s.timezone || '(UTC+5:30) Chennai, Kolkata, Mumbai, New Delhi');
          setDateFormat(s.dateFormat || 'DD/MM/YYYY');
          setMasterVoiceControl(s.voiceEnabled ?? true);
          setSelectedVoice(s.selectedVoice || 'Aria');
          setAutoReadResponses(s.autoPlayVoice ?? false);
        } else {
          console.error('Failed to load settings:', setRes.reason);
        }
        
      } catch (err) {
        console.error('Failed to load settings data', err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchSettingsData();
  }, [navigate]);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const handleSaveProfile = async (data: any) => {
    const apiPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      location: data.location,
      bio: data.bio,
      goal: data.learningGoal,
      level: data.skillLevel?.toLowerCase(),
      topics: data.topicsOfInterest,
      avatar: data.avatarUrl
    };

    const res = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
    });
    if (res.ok) {
      const json = await res.json();
      const updatedUser = json.data || json.profile || json;
      
      let joinedDate = 'Oct 2023';
      if (updatedUser.createdAt) {
        try {
          const d = new Date(updatedUser.createdAt);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          joinedDate = `${months[d.getMonth()]} ${d.getFullYear()}`;
        } catch (e) {}
      }

      const mappedProfile = {
        ...updatedUser,
        avatarUrl: updatedUser.avatar || '',
        learningGoal: updatedUser.goal || '',
        skillLevel: updatedUser.level ? updatedUser.level.charAt(0).toUpperCase() + updatedUser.level.slice(1) : '',
        topicsOfInterest: updatedUser.topics || [],
        joinedDate
      };
      setProfile(mappedProfile);
    } else throw new Error('Failed to save');
  };

  const handleTestVoice = async (name: string) => {
    const voiceMap: Record<string, { id: string; preview: string }> = {
      Aria: { id: 'EXAVITQu4vr4xnSDxMaL', preview: 'Hi, I am Aria your BodhAI learning assistant.' },
      Atlas: { id: 'VR6AewLTigWG4xSOukaG', preview: 'Hello, I am Atlas. Let us explore this together.' },
      Priya: { id: 'XB0fDUnXU5powFXDhCwa', preview: 'Namaste! I am Priya, ready to help you learn.' },
      Rohan: { id: 'onwK4e9ZLuTAKqWW03F9', preview: 'Hi there! I am Rohan. Let us get started!' },
      Nova: { id: 'pFZP5JQG7iQjIQuC4Bku', preview: 'Greetings. I am Nova. Processing your request.' },
      Luna: { id: 'jsCqWAovK2LkecY7zXl4', preview: 'Hello there. I am Luna. Shall we begin?' },
    };

    const target = voiceMap[name];
    if (!target) return;

    try {
      const response = await api.post('/voice/preview', {
        voiceId: target.id,
        voiceName: name
      }, {
        responseType: 'blob'
      });

      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      await audio.play();
    } catch (err) {
      console.warn('ElevenLabs preview failed, falling back to Web Speech API:', err);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(target.preview));
    }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'profile',       label: 'Profile',          icon: <User className="w-4 h-4" /> },
    { key: 'security',      label: 'Security',         icon: <Shield className="w-4 h-4" /> },
    { key: 'notifications', label: 'Notifications',    icon: <Bell className="w-4 h-4" /> },
    { key: 'voice',         label: 'Voice & Audio',    icon: <Mic className="w-4 h-4" /> },
    { key: 'language',      label: 'Language & Region',icon: <Globe className="w-4 h-4" /> },
  ];

  const initials = profile
    ? `${profile.firstName?.charAt(0) || ''}${profile.lastName?.charAt(0) || ''}`.toUpperCase()
    : userName?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden font-sans">
      <Sidebar userName={userName} />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          {toast}
        </div>
      )}

      <main className="flex-1 lg:pl-[var(--sidebar-width)] min-w-0 overflow-y-auto">
        <MobileTopBar title="Settings" />

        {/* Top bar */}
        <div className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-30 select-none">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search settings..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600 hidden sm:block">{userName || 'Account'}</span>
            <div
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
              onClick={() => setActiveTab('profile')}
              title="View Profile"
            >
              {initials}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10 pb-16">

          {/* Horizontal tab bar */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full overflow-x-auto scrollbar-none mb-8 select-none">
            <div className="flex gap-1 min-w-max">
              {tabs.map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === t.key
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── PROFILE TAB ── */}
          {activeTab === 'profile' && (
            isLoadingProfile ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-3">
                  <Loader size="md" className="mx-auto" />
                  <span className="text-sm text-slate-500 font-medium">Loading profile...</span>
                </div>
              </div>
            ) : profile ? (
            <div className="space-y-6">

              {/* ── Hero Card ── */}
              <ProfileHero profile={profile} onEditTrigger={() => setIsEditOpen(true)} />

              {/* ── Stats Row ── */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Topics Learned', value: stats.topicsLearned, badge: stats.topicsLearnedWeeklyDiff > 0 ? `+${stats.topicsLearnedWeeklyDiff} this week` : null, badgeColor: 'text-green-600 bg-green-50', icon: <BookOpen className="w-5 h-5" />, iconBg: 'bg-blue-50 text-blue-600' },
                    { label: 'Day Streak', value: stats.dayStreak, badge: stats.bestStreak ? `Best: ${stats.bestStreak}` : null, badgeColor: 'text-orange-500 bg-orange-50', icon: <Flame className="w-5 h-5" />, iconBg: 'bg-orange-50 text-orange-500' },
                    { label: 'Projects Built', value: stats.projectsBuilt, badge: null, badgeColor: '', icon: <Rocket className="w-5 h-5" />, iconBg: 'bg-purple-50 text-purple-600' },
                    { label: 'Hours Studied', value: stats.hoursStudied, badge: null, badgeColor: '', icon: <Timer className="w-5 h-5" />, iconBg: 'bg-blue-50 text-blue-600' },
                  ].map(s => (
                    <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${s.iconBg}`}>{s.icon}</div>
                        {s.badge && <span className={`text-xs font-bold px-2 py-0.5 rounded ${s.badgeColor}`}>{s.badge}</span>}
                      </div>
                      <div className="mt-4">
                        <span className="text-3xl font-bold text-slate-900">{s.value}</span>
                        <p className="text-sm text-slate-500 font-medium mt-1">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Left col: About + Mastery ── */}
                <div className="lg:col-span-2 space-y-6">

                  {/* About */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">About</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{profile.bio || 'No bio added yet. Click Edit Profile to add one.'}</p>
                    {(profile.topicsOfInterest || []).length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {profile.topicsOfInterest.map((t: string) => (
                          <span key={t} className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-xs font-medium border border-slate-200">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mastery by Topic */}
                  {mastery.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-5">Mastery by Topic</h3>
                      <div className="space-y-4">
                        {mastery.map((item: any, i: number) => {
                          const barColor = item.percentage >= 80 ? 'bg-blue-600' : item.percentage >= 60 ? 'bg-blue-500' : item.percentage >= 40 ? 'bg-blue-400' : 'bg-slate-300';
                          const textColor = item.percentage >= 80 ? 'text-blue-600' : item.percentage >= 60 ? 'text-blue-500' : item.percentage >= 40 ? 'text-blue-400' : 'text-slate-400';
                          return (
                            <div key={i} className="space-y-1.5">
                              <div className="flex justify-between text-sm font-semibold">
                                <span className="text-slate-700">{item.name}</span>
                                <span className={textColor}>{item.percentage}% · {item.level}</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${item.percentage}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recent Projects */}
                  {projects.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Projects</h3>
                      <div className="space-y-3">
                        {projects.map((p: any) => (
                          <div key={p.id} className="flex items-center gap-4 p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition">
                            {p.image && <img src={p.image} alt={p.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-800 truncate">{p.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                {(p.tech || []).map((t: string) => (
                                  <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">{t}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                p.status === 'Completed' ? 'bg-green-50 text-green-700' :
                                p.status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'
                              }`}>{p.status}</span>
                              <div className="w-full bg-slate-100 h-1 rounded-full mt-2">
                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${p.progress}%` }} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Right col: Active Roadmap ── */}
                <div className="space-y-6">
                  {roadmap && (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900">Active Roadmap</h3>
                      <p className="text-slate-500 text-sm mt-0.5">{roadmap.title}</p>
                      <div className="mt-4 space-y-1.5">
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${roadmap.progress}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 font-semibold">
                          <span>Progress</span><span>{roadmap.progress}%</span>
                        </div>
                      </div>
                      <div className="mt-5 space-y-4 pl-3 border-l border-slate-100 ml-1.5">
                        {(roadmap.milestones || []).map((m: any) => (
                          <div key={m.id} className="relative">
                            <div className="absolute -left-[19px] top-1">
                              {m.status === 'completed' && <div className="w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />}
                              {m.status === 'active' && (
                                <div className="relative flex h-3 w-3 items-center justify-center">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
                                </div>
                              )}
                              {m.status === 'upcoming' && <div className="w-2.5 h-2.5 bg-white border-2 border-slate-300 rounded-full" />}
                            </div>
                            <p className={`text-sm font-semibold ${m.status === 'active' ? 'text-blue-600' : m.status === 'upcoming' ? 'text-slate-400' : 'text-slate-800'}`}>{m.title}</p>
                            <p className={`text-xs mt-0.5 ${m.status === 'active' ? 'text-blue-400' : 'text-slate-400'}`}>{m.dateText}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
            ) : (
              <div className="flex items-center justify-center py-24">
                <p className="text-slate-400 text-sm">Could not load profile. Please refresh.</p>
              </div>
            )
          )}

          {/* ── SECURITY TAB ── */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <ChangePassword />
              <ConnectedAccounts />
              <ActiveSessions />
              <DangerZone />
            </div>
          )}

          {/* ── NOTIFICATIONS TAB ── */}
          {activeTab === 'notifications' && <NotificationsTab />}

          {/* ── VOICE & AUDIO TAB ── */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              {/* Master toggle */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between shadow-sm select-none">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Master Voice Control</h4>
                  <p className="text-xs text-slate-500">Enable Atlas speech synthesis globally across all chat rooms</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500">{masterVoiceControl ? 'ON' : 'OFF'}</span>
                  <Switch checked={masterVoiceControl} onCheckedChange={setMasterVoiceControl} className="data-[state=checked]:bg-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Mic className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Voice Input</h3>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex items-center justify-center h-28">
                    <div className="flex items-center gap-1.5">
                      {[4,8,14,22,12,6,8,16,26,18,10,4].map((h, i) => (
                        <div key={i} className="w-1 bg-blue-600 rounded-full" style={{ height: `${h}px` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Voice Shortcut</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Quick toggle listener</p>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600">Space</span>
                      <span className="text-slate-400 font-bold text-xs">+</span>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-bold text-slate-600">Hold</span>
                    </div>
                  </div>
                </div>

                {/* Output card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Voice Output</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase text-slate-500">
                      <span>Speech Speed</span>
                      <span>{settings.speed || 1.0}x</span>
                    </div>
                    <input
                      type="range" min="0.5" max="2.0" step="0.25"
                      value={settings.speed || 1.0}
                      onChange={e => setSpeed(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Auto-Read Responses</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">Read aloud newly arrived answers</p>
                    </div>
                    <Switch checked={autoReadResponses} onCheckedChange={setAutoReadResponses} className="data-[state=checked]:bg-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800">Ambient Background Audio</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">White noise background loops</p>
                    </div>
                    <Switch checked={ambientAudio} onCheckedChange={setAmbientAudio} className="data-[state=checked]:bg-blue-600" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase">Current Accent</label>
                    <div className="flex gap-3">
                      <select
                        value={currentAccent}
                        onChange={e => setCurrentAccent(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none"
                      >
                        <option>🇺🇸 American English</option>
                        <option>🇬🇧 British English</option>
                        <option>🇮🇳 Hindi Accent (Indian English)</option>
                      </select>
                      <button
                        onClick={() => handleTestVoice(selectedVoice)}
                        className="px-3 py-2 border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-blue-600" /> Test
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Select Voice */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-5">Select Voice</h3>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                  {[
                    { id: 'Aria', gender: '♀', desc: 'Soft & empathetic' },
                    { id: 'Atlas', gender: '♂', desc: 'Authoritative' },
                    { id: 'Priya', gender: '♀', desc: 'Warm & melodic' },
                    { id: 'Rohan', gender: '♂', desc: 'Energetic' },
                    { id: 'Nova', gender: '🤖', desc: 'Synthetic' },
                    { id: 'Luna', gender: '♀', desc: 'Serene & calm' },
                  ].map(v => {
                    const active = selectedVoice === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setSelectedVoice(v.id)}
                        className={`cursor-pointer rounded-xl border p-4 text-center space-y-2 relative transition ${active ? 'border-blue-600 bg-blue-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        {active && <div className="absolute top-2 right-2 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check className="w-2.5 h-2.5 stroke-[3]" /></div>}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm mx-auto font-bold ${active ? 'bg-blue-100 text-blue-700' : 'bg-slate-50 text-slate-500'}`}>{v.gender}</div>
                        <span className="text-xs font-bold text-slate-800 block">{v.id}</span>
                        <span className="text-[9px] text-slate-400 block">{v.desc}</span>
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); handleTestVoice(v.id); }}
                          className={`w-full py-1 rounded-lg text-[9px] font-bold uppercase transition ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >{active ? 'SELECTED' : 'TEST'}</button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={async () => { 
                    try {
                      await api.put('/settings/voice', {
                        voiceEnabled: masterVoiceControl,
                        selectedVoice: selectedVoice,
                        autoPlayVoice: autoReadResponses
                      });
                      setVoice(selectedVoice); 
                      setAccent(currentAccent); 
                      triggerToast('Voice preferences saved ✓'); 
                    } catch (e) {
                      triggerToast('Failed to save Voice preferences');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition shadow-md"
                >Save Preferences</button>
              </div>
            </div>
          )}

          {/* ── LANGUAGE & REGION TAB ── */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              {/* Display Language */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Display Language</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Select from 60 supported languages. RTL layouts align automatically.</p>
                  </div>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search languages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {SUPPORTED_LANGUAGES.filter(lang => 
                    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map(lang => {
                    const sel = displayLanguage === lang.code;
                    return (
                      <div
                        key={lang.code}
                        onClick={() => setDisplayLanguage(lang.code)}
                        className={`cursor-pointer rounded-xl border p-3 text-center relative transition ${sel ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}
                      >
                        {sel && <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center"><Check className="w-2 h-2 text-white stroke-[3]" /></div>}
                        <span className="text-xs font-black text-slate-800 block">{lang.nativeName}</span>
                        <span className="text-[9px] text-slate-400 uppercase font-medium">{lang.name} ({lang.dir.toUpperCase()})</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Response Mode */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">AI Response Language</h3>
                <div className="space-y-3">
                  {[
                    { id: 'Auto-detect', desc: 'Match my input language automatically' },
                    { id: 'Always English', desc: 'Respond in English regardless of input' },
                  ].map(opt => (
                    <label key={opt.id} className={`cursor-pointer rounded-xl border p-4 flex items-start gap-3 transition ${aiResponseMode === opt.id ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 hover:border-slate-300'}`}>
                      <input type="radio" name="aiMode" checked={aiResponseMode === opt.id} onChange={() => setAiResponseMode(opt.id)} className="mt-1 text-blue-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{opt.id}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{opt.desc}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-[10px] text-amber-800 font-semibold">Auto-detect supports 100+ languages with high precision.</span>
                </div>
              </div>

              {/* Regional */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-5">Regional Preferences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase">Timezone</label>
                    <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none">
                      <option>(UTC+5:30) New Delhi</option>
                      <option>(UTC-05:00) Eastern Time</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase">Date Format</label>
                    <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none">
                      <option>DD/MM/YYYY</option>
                      <option>MM/DD/YYYY</option>
                      <option>YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 font-extrabold uppercase">First Day of Week</label>
                    <select value={firstDayOfWeek} onChange={e => setFirstDayOfWeek(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-none">
                      <option>Monday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={async () => { 
                    try {
                      await api.put('/settings/language', {
                        language: displayLanguage,
                        aiResponseLang: aiResponseMode,
                        codeCommentsLang: commentsLanguage,
                        timezone: timezone,
                        dateFormat: dateFormat
                      });
                      setLanguage(displayLanguage); 
                      i18n.changeLanguage(displayLanguage);
                      triggerToast('Language preferences saved ✓'); 
                    } catch (e) {
                      triggerToast('Failed to save Language preferences');
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-semibold transition shadow-md"
                >Save Preferences</button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profileData={profile}
          onSave={handleSaveProfile}
          onSuccessMessage={triggerToast}
        />
      )}
    </div>
  );
}

