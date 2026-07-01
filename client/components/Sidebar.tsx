import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChat } from '@/context/ChatContext';
import {
  Plus,
  MessageSquare,
  Map,
  Wrench,
  Calendar,
  BarChart3,
  Sliders,
  Settings as SettingsIcon,
  LogOut,
  ChevronDown,
  ChevronRight,
  Trash2,
  LayoutGrid,
  Trophy,
  HelpCircle,
  TrendingUp,
  FlaskConical
} from 'lucide-react';
import TaskModeSelector from './modals/TaskModeSelector';
import OnboardingModal from './modals/OnboardingModal';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  userName: string;
  isOpen?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ userName }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { chats, activeChatId, setActiveChatId, deleteChat, clearAllChats } = useChat();
  const { profile, saveOnboarding } = useProfile();
  const { logout } = useAuth();
  
  const [isRecentChatsOpen, setIsRecentChatsOpen] = useState(true);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

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
      setIsNewChatModalOpen(true); // Open the chat selector right after onboarding
    } catch (err) {
      console.error('Failed to save onboarding:', err);
    }
  };

  const handleNewChatClick = () => {
    setIsNewChatModalOpen(true);
  };

  const handleLogout = () => {
    logout();
  };

  const isProfileOrSettings = location.pathname.startsWith('/profile');

  if (isProfileOrSettings) {
    // RENDER THE HIGH-FIDELITY PROFILE & SETTINGS SPECIFIC SIDEBAR
    // Width: 220px, bg-slate-900, full height fixed
    const menuItems = [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
      { path: '/roadmap', label: 'Learning Path', icon: Map },
      { path: '/progress', label: 'Mastery', icon: TrendingUp },
      { path: '/projects', label: 'Project Lab', icon: FlaskConical },
      { path: '/profile', label: 'Achievements', icon: Trophy, matchExact: true },
      { path: '/profile/security', label: 'Settings', icon: SettingsIcon, isSettings: true }
    ];

    const isPathActive = (item: typeof menuItems[0]) => {
      if (item.matchExact) {
        return location.pathname === '/profile';
      }
      if (item.isSettings) {
        return location.pathname.startsWith('/profile/security') || 
               location.pathname.startsWith('/profile/notifications') || 
               location.pathname.startsWith('/profile/connected-apps') ||
               location.pathname.startsWith('/settings');
      }
      return location.pathname === item.path;
    };

    return (
      <div className="fixed left-0 top-0 z-40 h-screen w-[220px] bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none">
        <div>
          {/* TOP Brand Header */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-3 px-4 pt-6 cursor-pointer group"
          >
            {/* Square 32px blue BodhAI icon */}
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg flex-shrink-0">
              B
            </div>
            <div className="min-w-0">
              <h2 className="text-white font-bold text-lg leading-none">BodhAI</h2>
              <span className="text-slate-400 text-xs mt-0.5 block">Thinking Space</span>
            </div>
          </div>

          {/* MAIN MENU Label */}
          <div className="text-slate-500 text-xs font-bold uppercase tracking-wider px-4 pt-6 pb-2">
            MAIN MENU
          </div>

          {/* Nav Items */}
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isPathActive(item);
              
              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.isSettings ? '/profile/security' : item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-150 text-sm font-medium ${
                    active
                      ? 'bg-slate-800 text-white border-l-2 border-blue-500'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM Section */}
        <div className="pb-6">
          <div className="border-t border-slate-800 my-4 mx-4" />
          
          <div className="space-y-1">
            <button
              onClick={() => alert("Redirecting to help center...")}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white transition-all text-sm font-medium"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help Center</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white transition-all text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER STANDARD CHAT SIDEBAR FOR CHAT / WORKSPACE / OTHER ROUTES
  const coreNavItems = [
    { path: '/roadmap', label: 'Roadmap', icon: Map },
    { path: '/projects', label: 'Project Builder', icon: Wrench },
    { path: '/planner', label: 'Productivity Planner', icon: Calendar },
    { path: '/progress', label: 'Progress Tracker', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
    { path: '/settings/ai-configuration', label: 'AI Configuration', icon: Sliders },
  ];

  const isActive = (path: string) => {
    if (path === '/settings') return location.pathname === '/settings';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-950/85 backdrop-blur-md border-r border-white/5 flex flex-col p-4 justify-between select-none">
        
        {/* Upper Side */}
        <div className="space-y-6 flex-1 overflow-y-auto pr-1 scrollbar-thin">
          
          {/* Glowing Brand Header */}
          <div 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-3 px-2 py-1 cursor-pointer group"
          >
            <div className="w-10 h-10 bg-white rounded-xl p-0.5 shadow-[0_0_15px_rgba(147,51,234,0.3)] group-hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] smooth-transition overflow-hidden">
              <div className="w-full h-full rounded-[10px] flex items-center justify-center bg-white overflow-hidden">
                <img 
                  src="/logo.jpeg" 
                  className="w-full h-full object-cover rounded-[10px] scale-[1.65] -translate-x-[18%] group-hover:scale-[1.8] smooth-transition" 
                  alt="BodhAI Logo" 
                />
              </div>
            </div>
            <div>
              <h2 className="text-md font-bold text-slate-100 group-hover:text-purple-300 smooth-transition leading-none">BodhAI</h2>
              <span className="text-[10px] text-slate-500 tracking-wider uppercase font-semibold">Offline Voice Mentor</span>
            </div>
          </div>

          {/* Action Button: Permanent + New Chat */}
          <button
            onClick={handleNewChatClick}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 text-white font-medium hover:brightness-110 smooth-transition shadow-[0_4px_15px_rgba(147,51,234,0.3)] hover:shadow-[0_4px_25px_rgba(147,51,234,0.5)] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="text-sm tracking-wide">New Chat</span>
          </button>

          {/* Nav List */}
          <nav className="space-y-1">
            
            {/* Recent Chats Section */}
            <div className="mb-2">
              <div className="group/header flex items-center justify-between pr-1 rounded-lg hover:bg-white/5 smooth-transition">
                <button
                  onClick={() => setIsRecentChatsOpen(!isRecentChatsOpen)}
                  className="flex-1 flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 smooth-transition uppercase tracking-wider text-left"
                >
                  <span className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Recent Chats
                  </span>
                  {isRecentChatsOpen ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
                
                {chats.length > 0 && isRecentChatsOpen && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete all recent chats?")) {
                        clearAllChats();
                        navigate('/dashboard');
                      }
                    }}
                    className="p-1 mr-1 rounded text-slate-500 hover:text-red-400 hover:bg-white/10 opacity-0 group-hover/header:opacity-100 smooth-transition"
                    title="Clear all chats"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sub-list of active chats */}
              {isRecentChatsOpen && (
                <div className="mt-1 pl-3 border-l border-white/5 ml-4 space-y-1">
                  {chats.map((chat) => {
                    const isSelected = activeChatId === chat.id;
                    return (
                      <div
                        key={chat.id}
                        className="group/item flex items-center justify-between rounded-lg hover:bg-white/5 smooth-transition"
                      >
                        <button
                          onClick={() => {
                            setActiveChatId(chat.id);
                            navigate(`/chat/${chat.id}`);
                          }}
                          className={`flex-1 text-left px-3 py-2 text-xs font-medium truncate block smooth-transition ${
                            isSelected
                              ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 border border-purple-500/20 rounded-l-lg'
                              : 'text-slate-400 group-hover/item:text-slate-200'
                          }`}
                        >
                          {chat.title}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                            if (activeChatId === chat.id) {
                              navigate('/dashboard');
                            }
                          }}
                          className="p-1 mr-1 rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 opacity-0 group-hover/item:opacity-100 smooth-transition"
                          title="Delete chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {chats.length === 0 && (
                    <span className="text-[10px] text-slate-600 block px-3 py-1 italic">No recent chats</span>
                  )}
                </div>
              )}
            </div>

            {/* Core Menu Links */}
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 smooth-transition text-sm font-medium ${
                    active
                      ? 'bg-white/10 text-slate-100 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border-l-2 border-purple-500 pl-2.5'
                      : 'hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Lower / Profile Section */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div
            className="flex items-center gap-3 px-2 cursor-pointer group"
            onClick={() => navigate('/settings')}
            title="Go to Settings & Profile"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-slate-100 text-xs shadow-inner group-hover:ring-2 group-hover:ring-purple-400 transition">
              {userName ? userName.charAt(0).toUpperCase() : 'D'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate leading-none mb-1 group-hover:text-purple-300 transition">{userName || 'User'}</p>
              <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase leading-none">Settings & Profile</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 smooth-transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Task Mode Selector Modal Overlay */}
      {isNewChatModalOpen && (
        <TaskModeSelector 
          isOpen={isNewChatModalOpen} 
          onClose={() => setIsNewChatModalOpen(false)} 
        />
      )}

      {/* Onboarding Modal Overlay */}
      {isOnboardingOpen && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onSave={handleSaveOnboarding}
        />
      )}
    </>
  );
}
