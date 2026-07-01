import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import VoiceAssistant from '@/components/VoiceAssistant';

export default function Voice() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(currentUser);
    setUserName(user.name);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex overflow-hidden">
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar
        userName={userName}
        isOpen={isSidebarOpen}
        onNavigate={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 w-full min-w-0 overflow-auto pl-0 md:pl-20 lg:pl-64">
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700/50 px-4 md:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen((open) => !open)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800/60 border border-slate-700/50 text-slate-200 hover:bg-slate-800 smooth-transition"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">Voice Assistant</h1>
              <p className="text-slate-400 mt-2">Learn through voice conversations with your AI mentor</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6 lg:p-8">
          <div className="max-w-3xl mx-auto">
            <VoiceAssistant />
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl opacity-20"></div>
      </div>
    </div>
  );
}
