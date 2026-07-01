import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import { Wrench, CheckSquare, Square, Sparkles, Code, Search, Mic, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { useProjects } from '@/hooks/useProjects';
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

export default function ProjectBuilder() {
  const navigate = useNavigate();
  const { createNewChat } = useChat();
  
  const { projects: backendProjects, isLoading, updateProject } = useProjects();
  const { profile } = useProfile();
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';
  
  // Custom states for checkable lists
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (backendProjects) {
      const mapped = backendProjects.map((bp: any) => {
        // Collect all tasks from all sprints
        const tasks: ProjectTask[] = [];
        bp.sprints?.forEach((sprint: any, sIdx: number) => {
          sprint.tasks?.forEach((taskStr: string, tIdx: number) => {
            tasks.push({
              id: `${bp.id}-${sIdx}-${tIdx}`,
              text: taskStr,
              completed: false // The backend doesn't store task-level completion easily, so simulate locally for now
            });
          });
        });

        // Add some default tasks if none exist
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
      setProjects(mapped);
    }
  }, [backendProjects]);

  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects((prev) => {
      const updated = prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        const newTasks = proj.tasks.map((task) => {
          if (task.id !== taskId) return task;
          return { ...task, completed: !task.completed };
        });
        
        // Compute new progress locally
        const completedCount = newTasks.filter(t => t.completed).length;
        const newProgress = newTasks.length > 0 ? Math.round((completedCount / newTasks.length) * 100) : 0;
        
        // Async update to backend (fire and forget for responsiveness)
        updateProject({ id: projectId, progress: newProgress }).catch(console.error);

        return { ...proj, tasks: newTasks, progress: newProgress };
      });
      return updated;
    });
  };

  const handleStartProjectMentor = async (proj: ProjectCard) => {
    const title = `💻 Code: Building ${proj.title}`;
    try {
      const chatId = await createNewChat(title, 'code');
      navigate(`/chat/${chatId}`);
    } catch (err) {
      console.error('Failed to create chat:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar userName={userName} />

      {/* Workspace Main Panel */}
      <main className="flex-1 min-w-0 overflow-y-auto pl-64 relative z-10">
        
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
              {userName ? userName.charAt(0).toUpperCase() : 'D'}
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-8 py-10 space-y-10">
          
          {/* Title Header */}
          <div className="space-y-2 select-none">
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-pink-600" />
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Practical Lab</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Interactive Project Builder
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-xl">
              Synthesize actual fully functional products matched to your curriculum. Complete project tasks to level up your credentials portfolio.
            </p>
          </div>

          {/* Project List */}
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-2">No Projects Found</h3>
              <p className="text-sm text-slate-500">Your AI curriculum hasn't generated any projects yet. Keep learning to unlock them!</p>
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
                  className="rounded-xl border border-slate-200/80 bg-white p-6 flex flex-col justify-between space-y-6 shadow-sm hover:border-pink-500/20 hover:shadow-md smooth-transition"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex justify-between items-center select-none">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        proj.difficulty === 'Advanced'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : 'bg-cyan-50 text-cyan-600 border-cyan-200'
                      }`}>
                        {proj.difficulty}
                      </span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide ${
                        proj.status === 'Started' ? 'text-pink-600' : 'text-slate-400 font-semibold'
                      }`}>
                        {proj.status}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-800">{proj.title}</h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{proj.desc}</p>
                    </div>

                    {/* Checkboxes Tasks */}
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

                  {/* Progress block & action */}
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

                    <button
                      onClick={() => handleStartProjectMentor(proj)}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-transparent hover:bg-slate-800 text-[11px] text-white font-bold uppercase tracking-wider smooth-transition"
                    >
                      <Code className="w-3.5 h-3.5" />
                      Consult Code Mentor
                    </button>
                  </div>

                </div>
              );
              })}
            </div>
          )}

        </div>

      </main>

    </div>
  );
}
