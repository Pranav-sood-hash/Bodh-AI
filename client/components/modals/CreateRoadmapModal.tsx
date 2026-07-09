import React, { useState, useEffect } from 'react';
import { Target, Clock, Award, Check, Sparkles, X, Loader2 } from 'lucide-react';
import api from '../../lib/axios';

interface CreateRoadmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: {
    title: string;
    goal: string;
    level: string;
    estimatedWeeks: number;
    focusAreas: string[];
  }) => Promise<void>;
}

export default function CreateRoadmapModal({ isOpen, onClose, onGenerate }: CreateRoadmapModalProps) {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState('intermediate');
  const [weeks, setWeeks] = useState(8);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!title.trim()) {
      setFocusAreas([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSuggesting(true);
      try {
        const { data } = await api.get(`/roadmap/suggest-focus?topic=${encodeURIComponent(title)}`);
        if (data.success && Array.isArray(data.data)) {
          setFocusAreas(data.data);
          setSelectedFocusAreas(data.data); // select all by default
        }
      } catch (err) {
        console.error('Failed to fetch suggested focus areas:', err);
      } finally {
        setIsSuggesting(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [title]);

  if (!isOpen) return null;

  const handleToggleFocusArea = (area: string) => {
    if (selectedFocusAreas.includes(area)) {
      setSelectedFocusAreas(selectedFocusAreas.filter((a) => a !== area));
    } else {
      setSelectedFocusAreas([...selectedFocusAreas, area]);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsGenerating(true);
    try {
      await onGenerate({
        title: title.trim(),
        goal: goal.trim() || `Master ${title.trim()}`,
        level,
        estimatedWeeks: weeks,
        focusAreas: selectedFocusAreas,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      
      {/* Modal Shell */}
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl relative p-8 space-y-6"
        style={{
          boxShadow: '0 0 50px rgba(6, 182, 212, 0.15)'
        }}
      >
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500" />
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            Build New Learning Roadmap
          </h2>
          <p className="text-xs text-slate-400 mt-1">Design a customized, AI-driven study path to organize your learning objectives.</p>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          
          {/* Topic/Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-350 uppercase tracking-wider block">
              Topic or Technology
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Development, Machine Learning, Cybersecurity"
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 smooth-transition"
            />
          </div>

          {/* Goal Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-350 uppercase tracking-wider block">
              Learning Goals / Notes
            </label>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Describe your learning goals, desired outcomes, or specific targets..."
              rows={3}
              className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 smooth-transition resize-none"
            />
          </div>

          {/* Experience level & duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-350 uppercase tracking-wider block">
                Starting Level
              </label>
              <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5 gap-1">
                {['beginner', 'intermediate', 'advanced'].map((l) => {
                  const isSelected = level === l;
                  return (
                    <button
                      key={l}
                      onClick={() => setLevel(l)}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg smooth-transition capitalize whitespace-nowrap ${
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

            {/* Weeks commitment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-355 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Duration (Weeks)
              </label>
              <div className="flex bg-slate-950/40 p-1 rounded-xl border border-white/5 gap-1">
                {[4, 8, 12, 16].map((w) => {
                  const isSelected = weeks === w;
                  return (
                    <button
                      key={w}
                      onClick={() => setWeeks(w)}
                      className={`flex-1 text-center py-2 text-xs font-bold rounded-lg smooth-transition whitespace-nowrap ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {w}w
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Suggested sub-areas checkbox list */}
          {(isSuggesting || focusAreas.length > 0) && (
            <div className="space-y-2 pt-2">
              <label className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Suggested Focus Subtopics
              </label>
              
              {isSuggesting ? (
                <div className="flex items-center gap-2 py-2 text-xs text-cyan-400 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating key focus areas for "{title}"...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {focusAreas.map((area) => {
                    const isChecked = selectedFocusAreas.includes(area);
                    return (
                      <button
                        key={area}
                        onClick={() => handleToggleFocusArea(area)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-medium smooth-transition flex items-center gap-1.5 ${
                          isChecked
                            ? 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300'
                            : 'border-white/5 bg-white/5 text-slate-400 hover:text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 text-cyan-300" />}
                        {area}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs font-extrabold uppercase tracking-wider smooth-transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || isGenerating}
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider rounded-xl hover:brightness-110 smooth-transition shadow-[0_4px_15px_rgba(6,182,212,0.3)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
          >
            {isGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isGenerating ? 'Synthesizing...' : 'Generate Roadmap →'}
          </button>
        </div>

      </div>
    </div>
  );
}
