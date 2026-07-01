import React from "react";
import { ExternalLink } from "lucide-react";

interface Project {
  id: string;
  title: string;
  image: string;
  tech: string[];
  progress: number;
  status: string;
}

interface RecentProjectsProps {
  projects: Project[];
}

export default function RecentProjects({ projects }: RecentProjectsProps) {
  const data = projects || [];

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
        <div className="flex justify-between items-center select-none mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
        </div>
        <p className="text-sm text-slate-500">No recent projects to display.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
      <div className="flex justify-between items-center select-none mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Recent Projects</h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition">
          View All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.map((project) => (
          <div 
            key={project.id} 
            className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md smooth-transition flex flex-col justify-between"
          >
            {/* Project Cover Image */}
            <div className="h-32 overflow-hidden relative">
              <img 
                src={project.image} 
                alt={project.title} 
                className="w-full h-full object-cover hover:scale-105 transition-all duration-500" 
              />
            </div>

            {/* Contents */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-slate-800 text-sm leading-snug">{project.title}</h4>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 cursor-pointer hover:text-slate-600 transition" />
                </div>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {project.tech.map((t) => {
                    const isPython = t === "PYTHON";
                    const isPytorch = t === "PYTORCH";
                    const isRust = t === "RUST";
                    const isReact = t === "REACT";
                    const isGo = t === "GO";

                    return (
                      <span
                        key={t}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono ${
                          isPython ? "bg-blue-100 text-blue-700" :
                          isPytorch ? "bg-orange-100 text-orange-700" :
                          isRust ? "bg-amber-100 text-amber-700" :
                          isReact ? "bg-cyan-100 text-cyan-700" :
                          isGo ? "bg-emerald-100 text-emerald-700" :
                          "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Progress and status */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>{project.status}</span>
                  <span>{project.progress}%</span>
                </div>
                
                {/* Horizontal progress indicator */}
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      project.progress === 100 ? "bg-green-500" : "bg-blue-500"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
