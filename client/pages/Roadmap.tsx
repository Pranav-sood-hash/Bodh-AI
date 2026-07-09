import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { 
  Map, 
  CheckCircle2, 
  Circle, 
  Lock, 
  Play, 
  Search, 
  Mic, 
  Settings as SettingsIcon, 
  Loader2, 
  Plus, 
  Compass, 
  Clock, 
  BookOpen, 
  Award,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useRoadmap } from '@/hooks/useRoadmap';
import { useProfile } from '@/hooks/useProfile';
import CreateRoadmapModal from '@/components/modals/CreateRoadmapModal';
import { useQueryClient } from '@tanstack/react-query';
import MilestoneQuizModal from '@/components/modals/MilestoneQuizModal';

interface RoadmapNode {
  id: string;
  title: string;
  desc: string;
  status: 'completed' | 'in-progress' | 'locked';
  pct: number;
  color: string;
  tags: string[];
  resources: string[];
  skillsGained: string[];
  estimatedHours: number;
  currentModule: string;
}

export default function Roadmap() {
  const navigate = useNavigate();
  const { createNewChat } = useChat();
  const { 
    roadmap, 
    milestones, 
    isLoading, 
    generateRoadmap, 
    isGenerating, 
    loadingMessage, 
    updateMilestone, 
    reoptimizeRoadmap, 
    isOptimizing 
  } = useRoadmap();
  
  const { profile } = useProfile();
  const queryClient = useQueryClient();
  const [activeNodeId, setActiveNodeId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Quiz Modal State
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [quizMilestoneId, setQuizMilestoneId] = useState('');
  const [quizMilestoneTitle, setQuizMilestoneTitle] = useState('');

  const handleOpenQuiz = (id: string, title: string) => {
    setQuizMilestoneId(id);
    setQuizMilestoneTitle(title);
    setIsQuizOpen(true);
  };

  const handleQuizSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['activeRoadmap'] });
  };

  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (milestones && milestones.length > 0 && !activeNodeId) {
      setActiveNodeId(milestones[0].id);
    }
  }, [milestones, activeNodeId]);

  const mappedMilestones: RoadmapNode[] = milestones.map((m: any, index: number) => {
    const colors = [
      'from-cyan-400 to-blue-500',
      'from-emerald-400 to-teal-500',
      'from-yellow-400 to-orange-500',
      'from-purple-400 to-pink-500'
    ];
    
    const pct = m.progress !== undefined ? m.progress : 
      (m.status === 'COMPLETED' ? 100 : (m.status === 'IN_PROGRESS' || m.status === 'ACTIVE' ? 45 : 0));
      
    const statusMap: any = {
      COMPLETED: 'completed',
      IN_PROGRESS: 'in-progress',
      ACTIVE: 'in-progress',
      LOCKED: 'locked',
      UPCOMING: 'locked'
    };

    return {
      id: m.id,
      title: m.title,
      desc: m.description || 'Continue your learning journey.',
      status: statusMap[m.status] || 'locked',
      pct,
      color: colors[index % colors.length],
      tags: m.tags || [],
      resources: m.resources || [],
      skillsGained: m.skillsGained || [],
      estimatedHours: m.estimatedHours || 10,
      currentModule: m.currentModule || ''
    };
  });

  const handleStartPractice = async (node: RoadmapNode) => {
    const title = `📚 Practice: ${node.title.split(': ')[1] || node.title}`;
    try {
      const chatId = await createNewChat(title, 'study');
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  const handleMarkComplete = async (nodeId: string) => {
    try {
      await updateMilestone({ id: nodeId, status: 'COMPLETED' });
      // Update active node to the completed milestone, or next one
      const currentIndex = mappedMilestones.findIndex(m => m.id === nodeId);
      if (currentIndex !== -1 && currentIndex + 1 < mappedMilestones.length) {
        setActiveNodeId(mappedMilestones[currentIndex + 1].id);
      }
    } catch (err) {
      console.error('Failed to complete milestone:', err);
    }
  };

  const handleReoptimize = async () => {
    try {
      await reoptimizeRoadmap();
    } catch (err) {
      console.error('Failed to reoptimize roadmap:', err);
    }
  };

  const handleGenerate = async (data: {
    title: string;
    goal: string;
    level: string;
    estimatedWeeks: number;
    focusAreas: string[];
  }) => {
    await generateRoadmap(data);
  };

  const renderActiveLoadingOverlay = () => {
    if (!isGenerating && !isOptimizing) return null;
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md text-white">
        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-6 shadow-2xl">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-100">
              {isGenerating ? 'Generating Learning Pathway' : 'Reoptimizing Roadmap'}
            </h3>
            <p className="text-sm text-cyan-400 font-semibold animate-pulse">
              {loadingMessage || 'Aligning nodes...'}
            </p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Please stand by. BodhAI is computing the optimal module sequence, prerequisites, and evaluation topics.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar userName={userName} />

      {/* Main Roadmap Area */}
      <main className="flex-1 min-w-0 overflow-y-auto pl-0 lg:pl-56 relative z-10 transition-all duration-300">
        
        {/* Top bar search & profile */}
        <div className="bg-white border-b border-slate-200/80 px-8 py-4 flex items-center justify-between sticky top-0 z-30 select-none">
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
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-10 space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-cyan-600" />
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">
                  {roadmap ? 'Active Pathway' : 'Standard Pathway'}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {roadmap ? roadmap.title : 'Interactive Study Roadmap'}
              </h1>
              <p className="text-sm text-slate-500 font-medium max-w-xl">
                {roadmap 
                  ? `Goal: ${roadmap.goal} (${roadmap.estimatedWeeks} weeks estimated)` 
                  : 'Track milestone credential completions. Click milestones to explore core units and start AI evaluation practice sessions.'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {roadmap && (
                <button
                  onClick={handleReoptimize}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl smooth-transition shadow-sm"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reoptimize Path
                </button>
              )}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-105 text-white rounded-xl smooth-transition shadow-md"
              >
                <Plus className="w-4 h-4" />
                {roadmap ? 'New Roadmap' : 'Create Roadmap'}
              </button>
            </div>
          </div>

          {/* Timeline Nodes Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left side: Timeline Steps */}
            <div className="lg:col-span-2 space-y-8 relative pl-6">
              
              {isLoading && (
                <div className="flex justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                </div>
              )}
              
              {!isLoading && mappedMilestones.length === 0 && (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                  <div className="w-12 h-12 bg-cyan-50 rounded-full flex items-center justify-center mx-auto">
                    <Compass className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="space-y-1 max-w-sm mx-auto">
                    <h3 className="text-sm font-bold text-slate-800">No Learning Roadmap Yet</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Establish a step-by-step personalized curriculum generated using advanced AI model parameters.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:brightness-105 smooth-transition shadow-md"
                  >
                    Build Your First Roadmap
                  </button>
                </div>
              )}

              {/* Vertical timeline line */}
              {mappedMilestones.length > 0 && <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-350" />}

              {mappedMilestones.map((node) => {
                const isActive = activeNodeId === node.id;
                const isCompleted = node.status === 'completed';
                const isLocked = node.status === 'locked';

                return (
                  <div
                    key={node.id}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`relative p-6 rounded-xl border smooth-transition cursor-pointer group ${
                      isActive
                        ? 'border-cyan-500/50 bg-cyan-50/20 shadow-sm'
                        : 'border-slate-200/80 bg-white hover:border-slate-300'
                    }`}
                  >
                    
                    {/* Node Dot Indicator */}
                    <div className="absolute -left-6 top-6 w-5 h-5 rounded-full bg-white flex items-center justify-center border border-slate-300 z-10 group-hover:scale-110 smooth-transition">
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : isLocked ? (
                        <Lock className="w-3 h-3 text-slate-400" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-yellow-500 stroke-[2.5] animate-pulse" />
                      )}
                    </div>

                    {/* Node Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold ${isActive ? 'text-cyan-700' : 'text-slate-800'}`}>
                          {node.title}
                        </h3>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded tracking-wide ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : isLocked
                            ? 'bg-slate-100 text-slate-400 border border-slate-200'
                            : 'bg-yellow-50 text-yellow-600 border border-yellow-200'
                        }`}>
                          {node.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{node.desc}</p>

                      {/* Micro Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                          <span>Milestone completion</span>
                          <span>{node.pct}%</span>
                        </div>
                        <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-gradient-to-r ${node.color}`}
                            style={{ width: `${node.pct}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>

            {/* Right side: Detailed Topic Details Card */}
            <div className="lg:col-span-1">
              {(() => {
                const node = mappedMilestones.find((m) => m.id === activeNodeId);
                if (!node) return null;

                return (
                  <div className="rounded-xl border border-slate-200/80 bg-white p-6 space-y-6 sticky top-24 shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[9px] text-cyan-600 font-bold uppercase tracking-wider block">milestone details</span>
                      <h3 className="text-sm font-extrabold text-slate-800 leading-snug">{node.title}</h3>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 border-y border-slate-100 py-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{node.estimatedHours} hrs</span>
                      </div>
                      {node.currentModule && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[120px]">{node.currentModule}</span>
                        </div>
                      )}
                    </div>

                    {/* Skills Gained */}
                    {node.skillsGained && node.skillsGained.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-cyan-500" />
                          Competency Acquired
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {node.skillsGained.map((skill, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resources */}
                    {node.resources && node.resources.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                          Suggested Resources
                        </span>
                        <div className="space-y-2">
                          {node.resources.map((resName, i) => {
                            const isUrl = resName.startsWith('http://') || resName.startsWith('https://');
                            return (
                              <div key={i} className="flex gap-2 items-start text-xs font-medium text-slate-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 mt-1.5 shrink-0" />
                                {isUrl ? (
                                  <a 
                                    href={resName} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="text-cyan-600 hover:underline font-bold"
                                  >
                                    Reference Material
                                  </a>
                                ) : (
                                  <span>{resName}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {node.tags && node.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-2">
                        {node.tags.map((t, i) => (
                          <span key={i} className="text-[9px] bg-cyan-50 text-cyan-700 font-bold px-1.5 py-0.5 rounded">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2.5 pt-2">
                      {node.status !== 'locked' ? (
                        <>
                          <button
                            onClick={() => handleStartPractice(node)}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:brightness-105 smooth-transition shadow-sm"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            Practice Topic
                          </button>
                          
                          {node.status !== 'completed' && (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleOpenQuiz(node.id, node.title)}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-xs uppercase tracking-wider hover:brightness-105 smooth-transition shadow-sm"
                              >
                                <Award className="w-3.5 h-3.5" />
                                Take Milestone Quiz
                              </button>
                              <button
                                onClick={() => handleMarkComplete(node.id)}
                                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider smooth-transition"
                              >
                                Mark Completed (Skip Quiz)
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 font-bold text-xs uppercase tracking-wider select-none">
                          <Lock className="w-3.5 h-3.5" />
                          Milestone Locked
                        </div>
                      )}
                    </div>

                  </div>
                );
              })()}
            </div>

          </div>

        </div>

      </main>

      {/* Generating Overlay */}
      {renderActiveLoadingOverlay()}

      {/* Creation Modal */}
      <CreateRoadmapModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGenerate={handleGenerate}
      />

      {/* Quiz Modal */}
      <MilestoneQuizModal
        milestoneId={quizMilestoneId}
        milestoneTitle={quizMilestoneTitle}
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        onSuccess={handleQuizSuccess}
      />

    </div>
  );
}
