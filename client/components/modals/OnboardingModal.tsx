import React, { useState } from 'react';
import { Target, Clock, Award, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { goal: string; level: string; hours: number }) => void;
}

export default function OnboardingModal({ isOpen, onClose, onSave }: OnboardingModalProps) {
  const [goal, setGoal] = useState('Master Fullstack Development');
  const [level, setLevel] = useState('Intermediate');
  const [hours, setHours] = useState(10);

  if (!isOpen) return null;

  const goals = [
    { id: 'Master Fullstack Development', label: 'Master Fullstack Dev', desc: 'Build React interfaces and Express API architectures.' },
    { id: 'Deep Dive into ML/AI', label: 'Deep Dive ML / AI', desc: 'Learn PyTorch, Neural networks, NLP model alignments.' },
    { id: 'Prepare for Technical Interviews', label: 'LeetCode & Interview Prep', desc: 'Algorithm masteries, Big-O metrics, mock interviews.' },
    { id: 'Build a Startup Prototype', label: 'Startup Fast Prototyping', desc: 'Accelerate product delivery with pre-built boilerplate stacks.' },
  ];

  const levels = ['Beginner', 'Intermediate', 'Expert'];
  const commits = [5, 10, 20, 40];

  const handleComplete = () => {
    onSave({ goal, level, hours });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
      
      {/* Modal Shell */}
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative p-8 space-y-6"
        style={{
          boxShadow: '0 0 50px rgba(0, 212, 255, 0.15)'
        }}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500" />
        
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Target className="w-6 h-6 text-cyan-400" />
            Configure Your Mindscape
          </h2>
          <p className="text-xs text-slate-400 mt-1">Set up your personalized offline mentor metrics</p>
        </div>

        {/* Step 1: Goal selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            Select Primary Goal
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {goals.map((g) => {
              const isSelected = goal === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`text-left p-4 rounded-xl border smooth-transition flex flex-col justify-between ${
                    isSelected
                      ? 'border-cyan-400/50 bg-cyan-900/10 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                      : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {g.label}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium leading-relaxed">{g.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Skill level and commitment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Skill level */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Experience Level
            </label>
            <div className="flex bg-slate-950/40 p-1.5 rounded-xl border border-white/5 gap-1">
              {levels.map((l) => {
                const isSelected = level === l;
                return (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg smooth-transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Weekly commit hours */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Weekly Commitment
            </label>
            <div className="flex bg-slate-950/40 p-1.5 rounded-xl border border-white/5 gap-1">
              {commits.map((c) => {
                const isSelected = hours === c;
                return (
                  <button
                    key={c}
                    onClick={() => setHours(c)}
                    className={`flex-1 text-center py-2 text-xs font-bold rounded-lg smooth-transition ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    {c} hrs
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex justify-end">
          <button
            onClick={handleComplete}
            className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 smooth-transition shadow-[0_4px_15px_rgba(6,182,212,0.3)] active:scale-95"
          >
            Optimize AI Alignment →
          </button>
        </div>

      </div>
    </div>
  );
}
