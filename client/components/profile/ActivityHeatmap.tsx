import React, { useState } from "react";

interface ActivityHeatmapProps {
  activityData: any[];
}

export default function ActivityHeatmap({ activityData }: ActivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  // Fallback generating empty data if none returned
  const data = activityData || [];

  const getIntensityColor = (count: number) => {
    if (count === 0) return "bg-slate-100";
    if (count <= 2) return "bg-blue-200";
    if (count <= 4) return "bg-blue-400";
    if (count <= 6) return "bg-blue-600";
    return "bg-blue-800";
  };

  const handleMouseEnter = (e: React.MouseEvent, cell: { date: string; count: number }) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.parentElement?.parentElement?.getBoundingClientRect();
    if (parentRect) {
      setHoveredCell({
        date: cell.date,
        count: cell.count,
        x: rect.left - parentRect.left + rect.width / 2,
        y: rect.top - parentRect.top - 38
      });
    }
  };

  const formatDateText = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Group cells into 52 weeks of 7 days
  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < data.length; i++) {
    currentWeek.push(data[i]);
    if (currentWeek.length === 7 || i === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Slice to exactly last 53 weeks max
  const displayWeeks = weeks.slice(-53);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative">
      <div className="flex justify-between items-center select-none mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Learning Activity</h3>
        <div className="bg-slate-100 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 flex items-center gap-1 cursor-pointer hover:bg-slate-150 transition">
          Last 12 Months <span className="text-[10px]">▼</span>
        </div>
      </div>

      {/* Heatmap Grid Wrapper */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-[3px] min-w-[640px]">
          {/* Day Label Column */}
          <div className="flex flex-col justify-between text-[10px] text-slate-400 font-semibold pr-2 select-none h-[96px] py-[3px]">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>

          {/* Weeks Grid */}
          <div className="flex flex-1 gap-[3px]">
            {displayWeeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.map((cell, dayIdx) => (
                  <div
                    key={dayIdx}
                    onMouseEnter={(e) => handleMouseEnter(e, cell)}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all hover:scale-125 hover:ring-1 hover:ring-blue-500 ${getIntensityColor(
                      cell.count
                    )}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Floating custom tooltip */}
        {hoveredCell && (
          <div
            className="absolute z-20 bg-slate-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 flex flex-col items-center gap-0.5 border border-slate-800 transition-all font-sans"
            style={{ left: hoveredCell.x, top: hoveredCell.y }}
          >
            <span className="font-bold">
              {hoveredCell.count === 0 ? "No" : hoveredCell.count} learning session{hoveredCell.count !== 1 ? "s" : ""}
            </span>
            <span className="text-slate-400">{formatDateText(hoveredCell.date)}</span>
            {/* Tooltip arrow */}
            <div className="w-1.5 h-1.5 bg-slate-900 border-r border-b border-slate-800 rotate-45 absolute bottom-[-4px] left-1/2 transform -translate-x-1/2" />
          </div>
        )}
      </div>

      {/* Bottom Legend Row */}
      <div className="flex justify-between items-center mt-4 border-t border-slate-100 pt-4 select-none">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LESS</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-100" />
          <div className="w-3 h-3 rounded-sm bg-blue-200" />
          <div className="w-3 h-3 rounded-sm bg-blue-400" />
          <div className="w-3 h-3 rounded-sm bg-blue-600" />
          <div className="w-3 h-3 rounded-sm bg-blue-800" />
        </div>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">MORE</span>
      </div>

    </div>
  );
}
