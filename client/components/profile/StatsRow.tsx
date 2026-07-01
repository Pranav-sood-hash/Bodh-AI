import React from "react";
import { BookOpen, Flame, Rocket, Timer } from "lucide-react";

interface StatsRowProps {
  stats: any;
}

export default function StatsRow({ stats }: StatsRowProps) {
  const data = stats || {
    topicsLearned: 0,
    topicsLearnedWeeklyDiff: 0,
    dayStreak: 0,
    bestStreak: 0,
    projectsBuilt: 0,
    hoursStudied: 0
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Topics Learned */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <BookOpen className="w-5 h-5" />
          </div>
          {data.topicsLearnedWeeklyDiff > 0 && (
            <span className="text-green-600 text-xs font-bold bg-green-50 px-2 py-0.5 rounded">
              +{data.topicsLearnedWeeklyDiff} this week
            </span>
          )}
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold text-slate-900">{data.topicsLearned}</span>
          <p className="text-sm text-slate-500 font-medium mt-1">Topics Learned</p>
        </div>
      </div>

      {/* Day Streak */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
            <Flame className="w-5 h-5" />
          </div>
          {data.bestStreak && (
            <span className="text-orange-500 text-xs font-bold bg-orange-50 px-2 py-0.5 rounded">
              Personal Best: {data.bestStreak}
            </span>
          )}
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold text-slate-900">{data.dayStreak}</span>
          <p className="text-sm text-slate-500 font-medium mt-1">Day Streak</p>
        </div>
      </div>

      {/* Projects Built */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
            <Rocket className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold text-slate-900">{data.projectsBuilt}</span>
          <p className="text-sm text-slate-500 font-medium mt-1">Projects Built</p>
        </div>
      </div>

      {/* Hours Studied */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-start">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <Timer className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <span className="text-3xl font-bold text-slate-900">{data.hoursStudied}</span>
          <p className="text-sm text-slate-500 font-medium mt-1">Hours Studied</p>
        </div>
      </div>

    </div>
  );
}
