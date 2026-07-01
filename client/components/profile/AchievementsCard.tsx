import React from "react";
import { Trophy, Code, Star } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: string;
  iconBg: string;
}

interface AchievementsCardProps {
  achievements: Achievement[];
}

export default function AchievementsCard({ achievements }: AchievementsCardProps) {
  const data = achievements || [];

  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Recent Achievements</h3>
        <p className="text-sm text-slate-500 mt-4">No achievements yet. Keep learning!</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    if (type === "trophy") return <Trophy className="w-5 h-5 text-yellow-600" />;
    if (type === "build") return <Code className="w-5 h-5 text-blue-600" />;
    return <Star className="w-5 h-5 text-purple-600" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Recent Achievements</h3>
      
      <div className="space-y-4 mt-4">
        {data.map((achievement) => (
          <div key={achievement.id} className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${achievement.iconBg}`}>
              {getIcon(achievement.type)}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-semibold text-slate-800">{achievement.title}</h4>
              <p className="text-xs text-slate-500 font-medium">{achievement.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
