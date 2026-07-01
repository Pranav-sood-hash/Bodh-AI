import React, { useState, useEffect } from "react";

interface MasteryItem {
  name: string;
  percentage: number;
  level: string;
  color: string;
  barColor: string;
}

interface MasteryByTopicProps {
  masteryData: MasteryItem[];
}

export default function MasteryByTopic({ masteryData }: MasteryByTopicProps) {
  const [animated, setAnimated] = useState(false);

  const data = masteryData || [];

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900 select-none">Mastery by Topic</h3>
        <p className="text-sm text-slate-500 mt-4">No mastery data available yet.</p>
      </div>
    );
  }

  useEffect(() => {
    // Trigger animation on mount
    const timer = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const getLevelColor = (percentage: number) => {
    if (percentage >= 80) return "text-blue-600";
    if (percentage >= 60) return "text-blue-500";
    if (percentage >= 40) return "text-blue-400";
    return "text-slate-400";
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-blue-600";
    if (percentage >= 60) return "bg-blue-500";
    if (percentage >= 40) return "bg-blue-400";
    return "bg-slate-300";
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 select-none">Mastery by Topic</h3>

      <div className="space-y-5 mt-5">
        {data.map((item, idx) => {
          const lvlColor = getLevelColor(item.percentage);
          const barColor = getBarColor(item.percentage);

          return (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-sm font-semibold select-none">
                <span className="text-slate-700">{item.name}</span>
                <span className={`${lvlColor}`}>
                  {item.percentage}% · {item.level}
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
                  style={{ width: animated ? `${item.percentage}%` : "0%" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
