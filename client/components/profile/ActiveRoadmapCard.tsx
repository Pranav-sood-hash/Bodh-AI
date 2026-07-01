import React from "react";

interface Milestone {
  id: string;
  title: string;
  status: "completed" | "active" | "upcoming";
  dateText: string;
}

interface RoadmapData {
  title: string;
  progress: number;
  milestones: Milestone[];
}

interface ActiveRoadmapCardProps {
  roadmap: RoadmapData;
}

export default function ActiveRoadmapCard({ roadmap }: ActiveRoadmapCardProps) {
  const data = roadmap;

  if (!data || !data.milestones || data.milestones.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Active Roadmap</h3>
        <p className="text-slate-500 text-sm mt-4">No active roadmap available. Create one to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Active Roadmap</h3>
      <p className="text-slate-500 text-sm mt-0.5">{data.title}</p>
      
      {/* Progress Bar */}
      <div className="mt-4 space-y-1.5">
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${data.progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-xs text-slate-400 font-semibold select-none">
          <span>Overall Progress</span>
          <span>{data.progress}%</span>
        </div>
      </div>

      {/* Milestones List */}
      <div className="mt-6 space-y-4 relative pl-3.5 border-l border-slate-100 ml-1.5">
        {data.milestones.map((milestone) => {
          const isCompleted = milestone.status === "completed";
          const isActive = milestone.status === "active";
          const isUpcoming = milestone.status === "upcoming";

          return (
            <div key={milestone.id} className="relative flex flex-col space-y-0.5">
              
              {/* Dot Icon absolute wrapper */}
              <div className="absolute left-[-20px] top-[5px] flex items-center justify-center">
                {isCompleted && (
                  <div className="w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
                )}
                {isActive && (
                  <div className="relative flex h-3 w-3 items-center justify-center">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600 border border-white" />
                  </div>
                )}
                {isUpcoming && (
                  <div className="w-2.5 h-2.5 bg-white border-2 border-slate-300 rounded-full" />
                )}
              </div>

              <span className={`text-sm font-semibold leading-none ${
                isActive ? "text-blue-600" : isUpcoming ? "text-slate-400" : "text-slate-800"
              }`}>
                {milestone.title}
              </span>
              <span className={`text-[10px] font-medium leading-none ${
                isActive ? "text-blue-500" : "text-slate-400"
              }`}>
                {milestone.dateText}
              </span>
            </div>
          );
        })}
      </div>

    </div>
  );
}
