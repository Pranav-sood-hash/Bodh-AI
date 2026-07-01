import React from 'react';
import { Sliders, Code, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { CompareData } from '@/context/ChatContext';

interface CompareViewProps {
  data: CompareData;
}

export default function CompareView({ data }: CompareViewProps) {
  return (
    <div className="w-full flex flex-col gap-6 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm transition-all duration-350 hover:shadow-md">
      
      {/* Compare Header Info */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-inner">
          <Sliders className="w-4 h-4 text-emerald-600 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-extrabold text-slate-800 tracking-wide">Paradigm Matrix</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Side-by-Side Architectural Deconstruction Table</p>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
        <table className="w-full border-collapse text-left bg-white min-w-[650px] table-fixed">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-[10px] font-extrabold text-slate-500 uppercase tracking-wider w-[180px]">Architectural Metric</th>
              <th className="p-4 text-xs font-extrabold text-emerald-600 uppercase tracking-widest border-l border-slate-200 bg-emerald-50/10">
                <div className="flex items-center justify-between">
                  <span className="truncate">{data.left.title}</span>
                  <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-200 font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0">
                    LEFT
                  </span>
                </div>
              </th>
              <th className="p-4 text-xs font-extrabold text-blue-600 uppercase tracking-widest border-l border-slate-200 bg-blue-50/10">
                <div className="flex items-center justify-between">
                  <span className="truncate">{data.right.title}</span>
                  <span className="text-[8px] bg-blue-50 text-blue-600 border border-blue-200 font-bold px-1.5 py-0.5 rounded tracking-wide shrink-0">
                    RIGHT
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            
            {/* Concept row */}
            <tr className="hover:bg-slate-50/30 transition-colors duration-150">
              <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Concept Overview</span>
              </td>
              <td className="p-4 text-slate-650 font-medium leading-relaxed border-l border-slate-200">
                {data.left.concept}
              </td>
              <td className="p-4 text-slate-650 font-medium leading-relaxed border-l border-slate-200">
                {data.right.concept}
              </td>
            </tr>

            {/* Architectural Core Points row */}
            <tr className="hover:bg-slate-50/30 transition-colors duration-150">
              <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Architectural Core</span>
              </td>
              <td className="p-4 space-y-1.5 border-l border-slate-200">
                {data.left.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </td>
              <td className="p-4 space-y-1.5 border-l border-slate-200">
                {data.right.points.map((pt, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </td>
            </tr>

            {/* Code Snippet row */}
            <tr>
              <td className="p-4 font-bold text-slate-700 flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Implementation Code</span>
              </td>
              
              <td className="p-4 border-l border-slate-200 bg-slate-900 overflow-hidden">
                <div className="rounded-lg overflow-hidden border border-white/5 shadow-inner">
                  <div className="bg-slate-955 px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
                    <Code className="w-3 h-3 text-slate-500" />
                    <span className="text-[8px] text-slate-400 font-mono font-bold tracking-wider">LEFT_PARADIGM</span>
                  </div>
                  <pre className="p-3 font-mono text-[10px] text-emerald-400 overflow-x-auto whitespace-pre leading-relaxed max-w-full">
                    {data.left.code}
                  </pre>
                </div>
              </td>

              <td className="p-4 border-l border-slate-200 bg-slate-900 overflow-hidden">
                <div className="rounded-lg overflow-hidden border border-white/5 shadow-inner">
                  <div className="bg-slate-955 px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
                    <Code className="w-3 h-3 text-slate-500" />
                    <span className="text-[8px] text-slate-400 font-mono font-bold tracking-wider">RIGHT_PARADIGM</span>
                  </div>
                  <pre className="p-3 font-mono text-[10px] text-cyan-400 overflow-x-auto whitespace-pre leading-relaxed max-w-full">
                    {data.right.code}
                  </pre>
                </div>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </div>
  );
}
