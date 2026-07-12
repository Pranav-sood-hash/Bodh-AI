import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/axios';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { 
  Wrench, CheckSquare, Square, Sparkles, Code, Search, 
  Settings as SettingsIcon, ArrowLeft, Upload, FileText, 
  CheckCircle2, AlertCircle, HelpCircle, Eye, Settings, Play, Lock,
  ChevronRight, RefreshCw, Star, Plus, X, Tag
} from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { Loader } from '@/components/ui/loader';
import { useProjects, useProjectDetail } from '@/hooks/useProjects';
import { useProfile } from '@/hooks/useProfile';

interface ProjectTask {
  id: string;
  text: string;
  completed: boolean;
}

interface ProjectCard {
  id: string;
  title: string;
  desc: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'Started' | 'Recommended' | 'Completed' | string;
  tasks: ProjectTask[];
  progress: number;
}

const TECH_PRESETS = ['React', 'Next.js', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'TailwindCSS', 'GraphQL', 'REST API', 'Socket.io', 'AWS'];

export default function ProjectBuilder() {
  const navigate = useNavigate();
  const { createNewChat } = useChat();
  const { projects: backendProjects, isLoading: isListLoading, updateProject, createProject, isCreating } = useProjects();
  const { profile } = useProfile();
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';
  
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  
  // Detailed Project States
  const { project: activeProject, isLoading: isDetailLoading } = useProjectDetail(activeProjectId);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  
  // Modal Settings States
  const [settingsProject, setSettingsProject] = useState<any | null>(null);
  const [isGeneratingProblem, setIsGeneratingProblem] = useState(false);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Create Project Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjName, setNewProjName] = useState('');
  const [newProjDesc, setNewProjDesc] = useState('');
  const [newProjPriority, setNewProjPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [newProjTechStack, setNewProjTechStack] = useState<string[]>([]);
  const [newProjCustomTech, setNewProjCustomTech] = useState('');

  // WebSocket Ref
  const socketRef = useRef<Socket | null>(null);

  // Load projects list
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (backendProjects) {
      const mapped = backendProjects.map((bp: any) => {
        const tasks: ProjectTask[] = [];
        bp.sprints?.forEach((sprint: any, sIdx: number) => {
          sprint.tasks?.forEach((taskStr: string, tIdx: number) => {
            tasks.push({
              id: `${bp.id}-${sIdx}-${tIdx}`,
              text: taskStr,
              completed: false
            });
          });
        });

        if (tasks.length === 0) {
          tasks.push({ id: `${bp.id}-t1`, text: 'Setup project workspace', completed: false });
          tasks.push({ id: `${bp.id}-t2`, text: 'Implement core functionality', completed: false });
        }

        return {
          id: bp.id,
          title: bp.name,
          desc: bp.description || 'A BodhAI practical project.',
          difficulty: bp.priority === 'HIGH' ? 'Advanced' : (bp.priority === 'MEDIUM' ? 'Intermediate' : 'Beginner'),
          status: bp.status,
          progress: bp.progress || 0,
          tasks
        };
      });

      const currentIdsAndStatus = JSON.stringify(projects.map(p => ({ id: p.id, status: p.status, progress: p.progress })));
      const newIdsAndStatus = JSON.stringify(mapped.map((p: any) => ({ id: p.id, status: p.status, progress: p.progress })));

      if (currentIdsAndStatus !== newIdsAndStatus) {
        setProjects(mapped);
      }
    }
  }, [backendProjects, projects]);

  // Connect to socket when workspace page is loaded
  useEffect(() => {
    if (!activeProjectId) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const token = localStorage.getItem('accessToken');
    const socketUrl = window.location.origin;

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket in ProjectBuilder workspace');
    });

    socket.on('step:validated', (data: any) => {
      if (data.projectId === activeProjectId) {
        showToastNotification(`Step validated! Score: ${data.score}%`);
        // Force refresh detail query to fetch fresh database states
        const event = new CustomEvent('refreshProjectDetails');
        window.dispatchEvent(event);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [activeProjectId]);

  // Add key listener for manual update triggers on event
  useEffect(() => {
    const handleRefresh = () => {
      // Small tick to trigger React Query invalidation
      api.get(`/projects/${activeProjectId}`).then(() => {
        // Trigger React Query invalidation by refetching
      }).catch(console.error);
    };
    window.addEventListener('refreshProjectDetails', handleRefresh);
    return () => window.removeEventListener('refreshProjectDetails', handleRefresh);
  }, [activeProjectId]);

  const showToastNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 4000);
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects((prev) => {
      return prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newTasks = proj.tasks.map((task) => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed };
        });
        
        const completedCount = newTasks.filter(t => t.completed).length;
        const newProgress = newTasks.length > 0 ? Math.round((completedCount / newTasks.length) * 100) : 0;
        
        updateProject({ id: projectId, progress: newProgress }).catch(console.error);

        return { ...proj, tasks: newTasks, progress: newProgress };
      });
    });
  };

  const handleStartProjectMentor = async (proj: any) => {
    const title = `💻 Code: Building ${proj.title || proj.name}`;
    try {
      const chatId = await createNewChat(title, 'code');
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  // Generate problem statement call
  const triggerGenerateProblem = async (projId: string) => {
    setIsGeneratingProblem(true);
    setError('');
    try {
      await api.post(`/projects/${projId}/generate-problem`);
      showToastNotification('AI Problem Statement generated successfully!');
      // Update settingsProject local state if open
      if (settingsProject && settingsProject.id === projId) {
        const updated = await api.get(`/projects/${projId}`);
        setSettingsProject(updated.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate problem statement');
    } finally {
      setIsGeneratingProblem(false);
    }
  };

  // Create step roadmap call
  const triggerCreateRoadmap = async (projId: string) => {
    setIsGeneratingRoadmap(true);
    setError('');
    try {
      await api.post(`/projects/${projId}/create-step-roadmap`);
      showToastNotification('AI Step-by-Step Roadmap generated successfully!');
      // Update settingsProject local state if open
      if (settingsProject && settingsProject.id === projId) {
        const updated = await api.get(`/projects/${projId}`);
        setSettingsProject(updated.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate step roadmap');
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Toggle step-by-step mode
  const handleToggleModePreference = async (proj: any, checked: boolean) => {
    try {
      const updated = await updateProject({ id: proj.id, isStepByStep: checked });
      if (settingsProject && settingsProject.id === proj.id) {
        setSettingsProject(updated);
      }
      showToastNotification(`Switched to ${checked ? 'Step-by-Step' : 'Classic'} mode`);
    } catch (err) {
      console.error('Failed to update project mode', err);
    }
  };

  const handleSelectMode = async (isStep: boolean) => {
    if (!activeProjectId) return;
    try {
      await updateProject({ id: activeProjectId, isStepByStep: isStep, hasSelectedMode: true });
      showToastNotification(`Mode initialized: ${isStep ? 'Step-by-Step' : 'Direct Submission'}`);
      
      if (isStep && (!activeProject?.steps || activeProject.steps.length === 0)) {
        await triggerCreateRoadmap(activeProjectId);
      }
      
      const event = new CustomEvent('refreshProjectDetails');
      window.dispatchEvent(event);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to select mode');
    }
  };


  // Create Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim()) return;
    try {
      await createProject({
        name: newProjName.trim(),
        description: newProjDesc.trim() || undefined,
        priority: newProjPriority,
        techStack: newProjTechStack
      });
      showToastNotification(`Project "${newProjName}" created!`);
      setIsCreateModalOpen(false);
      setNewProjName('');
      setNewProjDesc('');
      setNewProjPriority('MEDIUM');
      setNewProjTechStack([]);
      setNewProjCustomTech('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  const toggleTechChip = (tech: string) => {
    setNewProjTechStack(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const addCustomTech = () => {
    const t = newProjCustomTech.trim();
    if (t && !newProjTechStack.includes(t)) {
      setNewProjTechStack(prev => [...prev, t]);
    }
    setNewProjCustomTech('');
  };

  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError('');
    }
  };

  const handleStepUpload = async (stepId: string) => {
    if (!selectedFile) {
      setError('Please select a file to upload first.');
      return;
    }
    setIsUploading(true);
    setError('');
    setUploadProgress(15);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      setUploadProgress(40);
      await api.post(`/projects/steps/${stepId}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setUploadProgress(100);
      showToastNotification('File submitted! AI validation is running in the background.');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClassicSubmit = async (projId: string) => {
    if (!selectedFile) {
      setError('Please select a file to upload first.');
      return;
    }
    setIsUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      await api.post(`/projects/${projId}/submit-complete`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      showToastNotification('Project submitted successfully for final review!');
      setSelectedFile(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Render variables helper
  const steps = activeProject?.steps || [];
  const currentStep = steps.find((s: any) => s.id === activeStepId) || steps[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-hidden font-sans">
      <Sidebar userName={userName} />

      {/* Toast popup */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-slate-700/50">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
          {toast}
        </div>
      )}

      <main className="flex-1 min-w-0 overflow-y-auto lg:pl-[var(--sidebar-width)] relative z-10">
        <MobileTopBar title={activeProjectId ? "Project Workspace" : "Project Builder"} />

        {/* Top desktop header */}
        <div className="hidden lg:flex bg-white border-b border-slate-200 px-8 py-4 items-center justify-between sticky top-0 z-30 select-none">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search workspaces or assignments..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-pink-500/50"
            />
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/settings')}
              className="p-2 text-slate-400 hover:text-slate-600 transition"
              title="Settings"
            >
              <SettingsIcon className="w-4.5 h-4.5" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
              {userName ? userName.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        {/* WORKSPACE DETAILED PANEL */}
        {activeProjectId ? (
          isDetailLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
              <Loader size="md" className="mx-auto" />
              <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-indigo-600 bg-clip-text text-transparent animate-pulse">Opening workspace...</span>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-fadeIn">
              {/* Workspace Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 select-none">
                <div className="space-y-1.5">
                  <button 
                    onClick={() => setActiveProjectId(null)}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase tracking-wider mb-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to projects
                  </button>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">{activeProject.name}</h1>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${
                      activeProject.isStepByStep ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-rose-50 text-rose-600 border-rose-200'
                    }`}>
                      {activeProject.isStepByStep ? 'Step-by-Step Mode' : 'Classic Mode'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {activeProject.techStack?.map((t: string) => (
                      <span key={t} className="text-[10px] font-semibold bg-slate-100 border border-slate-200 text-slate-600 rounded-md px-2 py-0.5">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleStartProjectMentor(activeProject)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm"
                  >
                    <Code className="w-3.5 h-3.5" /> Consult AI Mentor
                  </button>
                  <button
                    onClick={() => setSettingsProject(activeProject)}
                    className="flex items-center justify-center w-10 h-10 border border-slate-200 hover:bg-slate-50 rounded-xl transition text-slate-500 hover:text-slate-900"
                    title="Configure Project Settings"
                  >
                    <Settings className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

              {/* Mode Selector or Workspace Layout Grid */}
              {!activeProject.hasSelectedMode ? (
                <div className="max-w-3xl mx-auto py-12 space-y-8 animate-fadeIn">
                  <div className="text-center space-y-2 select-none">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Choose Your Execution Mode</h2>
                    <p className="text-xs text-slate-500 font-semibold">Select how you want to build and submit this project. You can change this later in settings.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Option 1: Step-by-Step Mode */}
                    <button
                      onClick={() => handleSelectMode(true)}
                      className="group relative p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-500 hover:shadow-lg text-left transition-all duration-300 flex flex-col justify-between h-64 shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 smooth-transition">
                          <Wrench className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 smooth-transition">By Roadmap (Step-by-Step)</h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                            Learn incrementally. The AI breaks the project down into structured milestones. Upload files step-by-step and get guided validation.
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-indigo-650 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Select Step-by-Step mode &rarr;
                      </div>
                    </button>

                    {/* Option 2: Direct Submission */}
                    <button
                      onClick={() => handleSelectMode(false)}
                      className="group relative p-6 rounded-2xl border-2 border-slate-200 bg-white hover:border-pink-500 hover:shadow-lg text-left transition-all duration-300 flex flex-col justify-between h-64 shadow-sm"
                    >
                      <div className="space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:scale-110 smooth-transition">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-pink-600 smooth-transition">Direct Submission (Classic)</h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">
                            Build independently. Submit your entire completed repository as a single ZIP file for final AI grading and feedback.
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-bold text-pink-650 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Select Classic mode &rarr;
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel: Project overview + milestones */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Overview Card */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                    <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pink-500" /> AI Problem Statement
                    </h3>
                    
                    {activeProject.problemStatement ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 max-h-[220px] overflow-y-auto">
                        <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{activeProject.problemStatement}</p>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-5 text-center space-y-3">
                        <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-500 font-medium">No problem statement generated yet.</p>
                        <button
                          onClick={() => triggerGenerateProblem(activeProject.id)}
                          className="mx-auto flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg px-3 py-1.5 text-[10px] font-bold transition-all shadow-sm"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Generate AI Prompt
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Milestones / Steps timeline */}
                  {activeProject.isStepByStep && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                      <div className="flex justify-between items-center select-none">
                        <h3 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">Milestones Pipeline</h3>
                        <span className="text-[10px] text-slate-400 font-bold">{steps.length} Steps Total</span>
                      </div>

                      {steps.length === 0 ? (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-5 text-center space-y-3">
                          <AlertCircle className="w-8 h-8 text-slate-350 mx-auto" />
                          <p className="text-xs text-slate-500 font-medium">No step timeline exists yet.</p>
                          <button
                            onClick={() => triggerCreateRoadmap(activeProject.id)}
                            className="mx-auto flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-3.5 py-1.5 text-[10px] font-bold transition shadow-md"
                          >
                            <Sparkles className="w-3.5 h-3.5" /> Initialize Steps
                          </button>
                        </div>
                      ) : (
                        <div className="relative space-y-4 border-l-2 border-slate-100 pl-4 ml-2.5">
                          {steps.map((step: any, index: number) => {
                            const active = step.id === activeStepId || (!activeStepId && index === 0);
                            const isCompleted = step.status === 'COMPLETED';
                            const isValidating = step.status === 'VALIDATING' || step.status === 'IN_PROGRESS';
                            const isLocked = step.status === 'PENDING' && index > 0 && steps[index - 1]?.status !== 'COMPLETED';
                            
                            return (
                              <div 
                                key={step.id} 
                                onClick={() => { if (!isLocked) { setActiveStepId(step.id); } }}
                                className={`relative cursor-pointer group transition-all select-none p-3.5 rounded-xl border ${
                                  active 
                                    ? 'border-indigo-500 bg-indigo-50/20 shadow-sm' 
                                    : 'border-slate-100 hover:border-slate-200 bg-white'
                                } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {/* Marker Node */}
                                <div className="absolute -left-[27px] top-1/2 -translate-y-1/2">
                                  {isCompleted ? (
                                    <div className="w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-sm"><CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /></div>
                                  ) : isValidating ? (
                                    <div className="w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-white shadow-sm"><Loader size="sm" className="w-3 h-3" /></div>
                                  ) : isLocked ? (
                                    <div className="w-5 h-5 bg-slate-250 border-2 border-white rounded-full flex items-center justify-center text-slate-400 shadow-sm"><Lock className="w-3 h-3" /></div>
                                  ) : (
                                    <div className="w-5 h-5 bg-white border-2 border-indigo-400 rounded-full flex items-center justify-center text-indigo-500 shadow-sm"><Play className="w-3 h-3 fill-indigo-500" /></div>
                                  )}
                                </div>

                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-xs font-bold text-slate-800 line-clamp-1">{step.title}</p>
                                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Order #{step.order} · {step.estimatedHours || 2} hours</p>
                                  </div>
                                  {!isLocked && <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Panel: Step execution or Final evaluation */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* CLASSIC MODE: Final zip/file submission */}
                  {!activeProject.isStepByStep && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                      <div className="space-y-1">
                        <h3 className="text-md font-bold text-slate-900">Project Deliverable Submission</h3>
                        <p className="text-xs text-slate-500">Upload your completed codebase as a ZIP file to trigger a high-fidelity AI grading and review.</p>
                      </div>

                      {/* File Upload Zone */}
                      <div className="border-2 border-dashed border-slate-250 hover:border-pink-500/50 rounded-2xl p-8 text-center bg-slate-50/50 space-y-4 transition">
                        <Upload className="w-10 h-10 text-slate-450 mx-auto" />
                        <div className="space-y-1">
                          <label className="cursor-pointer inline-flex bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-4 py-2 text-xs font-bold transition shadow-sm">
                            Choose ZIP File
                            <input type="file" className="hidden" accept=".zip" onChange={handleFileChange} />
                          </label>
                          <p className="text-[10px] text-slate-400">Accepts zip format up to 20MB</p>
                        </div>
                        {selectedFile && (
                          <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between max-w-sm mx-auto">
                            <span className="text-xs font-bold text-slate-700 truncate pr-4">{selectedFile.name}</span>
                            <span className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        )}
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleClassicSubmit(activeProject.id)}
                        disabled={isUploading || !selectedFile}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
                      >
                        {isUploading ? <Loader size="sm" /> : <Code className="w-4 h-4" />}
                        Submit Project Files
                      </button>

                      {/* AI Review Score & Feedback */}
                      {(activeProject.aiValidationScore !== null || activeProject.aiValidationFeedback) && (
                        <div className="border-t border-slate-250 pt-6 space-y-4 animate-fadeIn">
                          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">AI Evaluation Summary</h4>
                          <div className="flex flex-col sm:flex-row gap-5 items-center bg-slate-50 border border-slate-100 rounded-2xl p-5">
                            {activeProject.aiValidationScore !== null && (
                              <div className="w-20 h-20 rounded-full border-4 border-indigo-500 bg-white flex flex-col items-center justify-center shadow-sm">
                                <span className="text-xl font-black text-indigo-600">{activeProject.aiValidationScore}</span>
                                <span className="text-[8px] text-slate-400 font-extrabold uppercase">Score</span>
                              </div>
                            )}
                            <div className="flex-1 text-center sm:text-left">
                              <p className="text-xs text-slate-650 leading-relaxed whitespace-pre-wrap">{activeProject.aiValidationFeedback || 'Review pending...'}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP-BY-STEP MODE: Individual step details + validation */}
                  {activeProject.isStepByStep && currentStep && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                      
                      {/* Step Header */}
                      <div className="space-y-1.5 pb-4 border-b border-slate-100">
                        <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest block">Step Execution Pane</span>
                        <h2 className="text-md font-bold text-slate-900">{currentStep.title}</h2>
                        <p className="text-xs text-slate-500 leading-relaxed">{currentStep.description}</p>
                      </div>

                      {/* Step Specifications */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Target Deliverable</span>
                          <p className="text-xs font-bold text-slate-800">{currentStep.deliverable}</p>
                          <div className="flex gap-1.5 pt-1">
                            {currentStep.expectedFileTypes?.map((t: string) => (
                              <span key={t} className="text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold uppercase">{t}</span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Criteria list</span>
                          <div className="space-y-1">
                            {currentStep.validationCriteria?.map((c: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-600">
                                <span className="text-indigo-500 font-bold shrink-0">•</span>
                                <span className="leading-tight">{c}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Reveal Hint Drawer */}
                      {currentStep.hint && (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-350">
                          <button
                            onClick={() => setShowHint(!showHint)}
                            className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-slate-100/80 text-xs font-bold text-slate-700 transition select-none"
                          >
                            <span className="flex items-center gap-1.5"><HelpCircle className="w-4 h-4 text-indigo-500" /> Reveal Code Snippet Hint</span>
                            <span className="text-[10px] text-slate-450 uppercase">{showHint ? 'Hide' : 'Show'}</span>
                          </button>
                          {showHint && (
                            <div className="p-4 border-t border-slate-200 bg-slate-900 text-slate-100 overflow-x-auto">
                              <pre className="text-xs font-mono whitespace-pre-wrap">{currentStep.hint}</pre>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Upload / Submission Zone */}
                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center select-none">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submit Deliverable File</span>
                          {currentStep.status === 'VALIDATING' && (
                            <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                              <Loader size="sm" /> AI checking...
                            </span>
                          )}
                        </div>

                        {/* File box */}
                        <div className="border-2 border-dashed border-slate-250 hover:border-indigo-500/50 rounded-2xl p-6 text-center bg-slate-50/50 space-y-3 transition">
                          <Upload className="w-8 h-8 text-slate-450 mx-auto" />
                          <div>
                            <label className="cursor-pointer inline-flex bg-slate-900 hover:bg-slate-800 text-white rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-sm">
                              Choose File
                              <input type="file" className="hidden" onChange={handleFileChange} />
                            </label>
                          </div>
                          {selectedFile && (
                            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between max-w-sm mx-auto">
                              <span className="text-xs font-bold text-slate-700 truncate pr-4">{selectedFile.name}</span>
                              <span className="text-[9px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                            </div>
                          )}
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                          </div>
                        )}

                        <button
                          onClick={() => handleStepUpload(currentStep.id)}
                          disabled={isUploading || !selectedFile || currentStep.status === 'VALIDATING'}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md transition flex items-center justify-center gap-2"
                        >
                          {isUploading ? <Loader size="sm" /> : <Upload className="w-4 h-4" />}
                          Submit File
                        </button>
                      </div>

                      {/* AI evaluation panel for Step */}
                      {(currentStep.status === 'VALIDATING' || currentStep.status === 'IN_PROGRESS') && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 animate-pulse">
                          <Loader size="sm" className="flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-blue-800">AI Background Verification In Progress</p>
                            <p className="text-[10px] text-blue-600 mt-1 leading-normal">Our AI validation process checks your deliverables for structured logic and correct formatting. Results update automatically here.</p>
                          </div>
                        </div>
                      )}

                      {/* Completed / Checked details */}
                      {currentStep.status === 'COMPLETED' && (
                        <div className="border-t border-slate-100 pt-6 space-y-4 animate-fadeIn">
                          <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Validation Report</h4>
                          <div className="flex items-start gap-3 bg-emerald-50/40 border border-emerald-100 rounded-xl p-4">
                            <div className="w-12 h-12 rounded-full border-4 border-emerald-500 bg-white flex flex-col items-center justify-center shrink-0 shadow-sm">
                              <span className="text-sm font-black text-emerald-600">{currentStep.aiScore || 100}</span>
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">Mastery Feedback</p>
                              <p className="text-xs text-slate-650 mt-1 leading-relaxed whitespace-pre-wrap">{currentStep.aiFeedback || 'Deliverable successfully validated!'}</p>
                            </div>
                          </div>
                          {currentStep.aiSuggestions?.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Areas for enhancement</span>
                              <div className="space-y-1.5">
                                {currentStep.aiSuggestions.map((s: string, idx: number) => (
                                  <div key={idx} className="flex items-start gap-2 bg-slate-50 border border-slate-100 rounded-lg p-2.5 text-xs text-slate-700 font-medium">
                                    <Star className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500 shrink-0 mt-0.5" />
                                    <span>{s}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                </div>

              </div>
              )}

            </div>
          )
        ) : (
          /* PROJECTS GRID VIEW */
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10">
            {/* Title Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2 select-none">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-pink-600" />
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Practical Lab</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  Interactive Project Builder
                </h1>
                <p className="text-sm text-slate-500 font-medium max-w-xl">
                  Build real-world products matched to your curriculum. Complete milestones to level up your credentials.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>

            {isListLoading ? (
              <div className="flex justify-center p-12">
                <Loader size="md" className="mx-auto" />
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed select-none space-y-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                  <Wrench className="w-7 h-7 text-pink-500" />
                </div>
                <div className="text-center space-y-1.5">
                  <h3 className="text-base font-bold text-slate-800">No Projects Yet</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">Create your first project workspace to start building real products and earning credentials.</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Create First Project
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {projects.map((proj) => {
                  const completedTasksCount = proj.tasks.filter((t) => t.completed).length;
                  const totalTasksCount = proj.tasks.length;
                  const progressPct = proj.progress;

                  return (
                    <div 
                      key={proj.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-6 flex flex-col justify-between space-y-6 shadow-sm hover:border-pink-500/20 hover:shadow-md smooth-transition"
                    >
                      <div className="space-y-4">
                        {/* Card Header */}
                        <div className="flex justify-between items-center select-none">
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                            proj.difficulty === 'Advanced'
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-cyan-50 text-cyan-600 border-cyan-200'
                          }`}>
                            {proj.difficulty}
                          </span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wide text-pink-600">
                            {proj.status}
                          </span>
                        </div>

                        {/* Title */}
                        <div className="space-y-1">
                          <h3 className="text-sm font-bold text-slate-850">{proj.title}</h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{proj.desc}</p>
                        </div>

                        {/* Tasks Checklist */}
                        <div className="space-y-2.5 pt-2">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Task Checklist</span>
                          
                          <div className="space-y-2">
                            {proj.tasks.map((task) => (
                              <div
                                key={task.id}
                                onClick={() => handleToggleTask(proj.id, task.id)}
                                className="flex items-start gap-2.5 cursor-pointer group shrink-0"
                              >
                                <button className="text-slate-400 hover:text-pink-600 smooth-transition shrink-0 mt-0.5">
                                  {task.completed ? (
                                    <CheckSquare className="w-4 h-4 text-pink-500" />
                                  ) : (
                                    <Square className="w-4 h-4 text-slate-300 group-hover:text-slate-400" />
                                  )}
                                </button>
                                <span className={`text-xs font-medium leading-normal smooth-transition ${
                                  task.completed ? 'text-slate-400 line-through' : 'text-slate-650'
                                }`}>
                                  {task.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Footer Actions */}
                      <div className="space-y-4 pt-4 border-t border-slate-100 select-none">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-slate-400 font-bold uppercase">
                            <span>Project progress</span>
                            <span>{progressPct}% ({completedTasksCount}/{totalTasksCount} tasks)</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-400 to-purple-500"
                              style={{ width: `${progressPct}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setActiveProjectId(proj.id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-900 border border-transparent hover:bg-slate-800 text-[11px] text-white font-bold uppercase tracking-wider smooth-transition shadow-sm"
                          >
                            <Eye className="w-4 h-4" /> Open Workspace
                          </button>
                          
                          <button
                            onClick={() => setSettingsProject(proj)}
                            className="w-12 border border-slate-200 hover:bg-slate-50 rounded-xl flex items-center justify-center transition text-slate-500 hover:text-slate-900"
                            title="Configure Settings"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODE CONFIGURATION MODAL */}
      {settingsProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative select-none animate-scaleUp">
            <h3 className="text-md font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" />
              Configure Project Workspace
            </h3>
            <p className="text-xs text-slate-500 mb-6">Select your validation mode preference and initialize learning models.</p>

            <div className="space-y-5">
              {/* Switch modes */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Step-by-Step Validation Mode</span>
                  <span className="text-[10px] text-slate-400 font-medium">Verify individual milestone files vs complete code.</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={settingsProject.isStepByStep}
                    onChange={(e) => handleToggleModePreference(settingsProject, e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Action buttons */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                  <span>AI Utilities</span>
                </div>
                
                <button
                  onClick={() => triggerGenerateProblem(settingsProject.id)}
                  disabled={isGeneratingProblem}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                >
                  {isGeneratingProblem ? (
                    <Loader size="sm" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  )}
                  {settingsProject.problemStatement ? 'Regenerate Problem Statement' : 'Generate Problem Statement'}
                </button>

                {settingsProject.isStepByStep && (
                  <button
                    onClick={() => triggerCreateRoadmap(settingsProject.id)}
                    disabled={isGeneratingRoadmap}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
                  >
                    {isGeneratingRoadmap ? (
                      <Loader size="sm" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                    )}
                    Generate Step-by-Step Timeline
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100 mt-6">
              <button
                type="button"
                onClick={() => setSettingsProject(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}
      {/* CREATE PROJECT MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative select-none animate-scaleUp">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4.5 h-4.5 text-pink-500" />
                  New Project Workspace
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Define your project and let AI generate the roadmap.</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Chat Application, E-Commerce Store..."
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Description</label>
                <textarea
                  placeholder="Describe what you want to build..."
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition resize-none"
                />
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">Difficulty Level</label>
                <div className="flex gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewProjPriority(p)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition ${
                        newProjPriority === p
                          ? p === 'HIGH' ? 'bg-rose-500 border-rose-500 text-white' : p === 'MEDIUM' ? 'bg-amber-500 border-amber-500 text-white' : 'bg-emerald-500 border-emerald-500 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      {p === 'LOW' ? 'Beginner' : p === 'MEDIUM' ? 'Intermediate' : 'Advanced'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Tag className="w-3 h-3" /> Tech Stack
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TECH_PRESETS.map(tech => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTechChip(tech)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition ${
                        newProjTechStack.includes(tech)
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom tech..."
                    value={newProjCustomTech}
                    onChange={e => setNewProjCustomTech(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomTech(); } }}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition"
                  />
                  <button
                    type="button"
                    onClick={addCustomTech}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition"
                  >
                    Add
                  </button>
                </div>
                {newProjTechStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {newProjTechStack.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg px-2 py-0.5 text-[10px] font-bold">
                        {t}
                        <button type="button" onClick={() => setNewProjTechStack(prev => prev.filter(x => x !== t))} className="hover:text-rose-500 transition"><X className="w-2.5 h-2.5" /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCreateModalOpen(false); setError(''); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProjName.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold transition shadow-sm"
                >
                  {isCreating ? <Loader size="sm" /> : <Plus className="w-3.5 h-3.5" />}
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
