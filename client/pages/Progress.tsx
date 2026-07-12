import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import MobileTopBar from '@/components/MobileTopBar';
import { BarChart3, TrendingUp, Sparkles, Award, Search, Mic, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useProgress } from '@/hooks/useProgress';
import { useProfile } from '@/hooks/useProfile';

export default function Progress() {
  const navigate = useNavigate();
  const { progress, heatmap, isLoading } = useProgress();
  const { profile } = useProfile();
  const userName = profile ? `${profile.firstName} ${profile.lastName}` : '';

  // Helper to construct the heatmap grid of 28 weeks (columns) and 7 days (rows)
  const getHeatmapGrid = () => {
    const today = new Date();
    // Get current day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDay = today.getDay();
    // Map Sunday (0) to 6, Monday (1) to 0, Tuesday (2) to 1, etc.
    const dayOffset = currentDay === 0 ? 6 : currentDay - 1;

    // Find the Monday of the current week
    const currentWeekMonday = new Date(today);
    currentWeekMonday.setDate(today.getDate() - dayOffset);
    currentWeekMonday.setHours(0, 0, 0, 0);

    // Start date is Monday of 27 weeks ago (total 28 weeks including current week)
    const startDate = new Date(currentWeekMonday);
    startDate.setDate(currentWeekMonday.getDate() - 27 * 7);

    // Create a lookup map of log dates to their activity counts
    const logMap = new Map<string, { activityCount: number; hoursStudied: number }>();
    
    // Merge backend activity logs and heatmap
    const allLogs = [
      ...(heatmap || []),
      ...(progress?.activityLogs || [])
    ];

    allLogs.forEach((log: any) => {
      if (!log.date) return;
      const logDate = new Date(log.date);
      const year = logDate.getFullYear();
      const month = String(logDate.getMonth() + 1).padStart(2, '0');
      const day = String(logDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const count = log.activityCount !== undefined ? log.activityCount : (log.count || 0);
      const hours = log.hoursStudied || 0;

      const existing = logMap.get(dateStr);
      if (existing) {
        logMap.set(dateStr, {
          activityCount: Math.max(existing.activityCount, count),
          hoursStudied: Math.max(existing.hoursStudied, hours)
        });
      } else {
        logMap.set(dateStr, { activityCount: count, hoursStudied: hours });
      }
    });

    const grid = [];
    for (let col = 0; col < 28; col++) {
      const colDays = [];
      for (let row = 0; row < 7; row++) {
        const cellDate = new Date(startDate);
        cellDate.setDate(startDate.getDate() + col * 7 + row);
        
        const year = cellDate.getFullYear();
        const month = String(cellDate.getMonth() + 1).padStart(2, '0');
        const day = String(cellDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const logData = logMap.get(dateStr);
        colDays.push({
          date: cellDate,
          dateStr,
          count: logData ? logData.activityCount : 0,
          hoursStudied: logData ? logData.hoursStudied : 0
        });
      }
      grid.push(colDays);
    }
    return grid;
  };

  // Helper to group daily logs into 5 weeks for Recharts Volume Progress
  const getWeeklyData = () => {
    const logs = progress?.activityLogs || [];
    if (logs.length === 0) {
      return [
        { week: 'Wk 1', Target: 10, Practiced: 8 },
        { week: 'Wk 2', Target: 10, Practiced: 11 },
        { week: 'Wk 3', Target: 15, Practiced: 14 },
        { week: 'Wk 4', Target: 15, Practiced: 18 },
        { week: 'Wk 5', Target: 20, Practiced: 16 },
      ];
    }

    const today = new Date();
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(today.getDate() - distanceToMonday);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const weeks = Array.from({ length: 5 }).map((_, idx) => {
      const weekStart = new Date(startOfCurrentWeek);
      weekStart.setDate(startOfCurrentWeek.getDate() - (4 - idx) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return {
        label: `Wk ${idx + 1}`,
        start: weekStart,
        end: weekEnd,
        Practiced: 0,
        Target: 10 + idx * 2.5,
      };
    });

    logs.forEach((log: any) => {
      const logDate = new Date(log.date);
      for (const w of weeks) {
        if (logDate >= w.start && logDate <= w.end) {
          w.Practiced += log.hoursStudied || 0;
          break;
        }
      }
    });

    return weeks.map(w => ({
      week: w.label,
      Target: w.Target,
      Practiced: parseFloat(w.Practiced.toFixed(1))
    }));
  };

  // Use dynamic mastery if available
  const rawMastery = progress?.topicMastery || progress?.mastery || [];
  const mappedGauges = rawMastery.length > 0
    ? rawMastery.map((m: any, idx: number) => {
        const colors = [
          'from-emerald-500 to-teal-500',
          'from-yellow-500 to-orange-500',
          'from-cyan-500 to-blue-500',
          'from-purple-500 to-pink-500'
        ];
        return {
          name: m.topic || m.name,
          val: m.mastery !== undefined ? m.mastery : (m.val || 0),
          color: colors[idx % colors.length]
        };
      })
    : [
        { name: 'Pythonic Constructs & Exception Systems', val: 95, color: 'from-emerald-500 to-teal-500' },
        { name: 'Data Structures & Sort Algorithms Complexity', val: 72, color: 'from-yellow-500 to-orange-500' },
        { name: 'OOP Encapsulation & Polymorphic Architectures', val: 50, color: 'from-cyan-500 to-blue-500' },
        { name: 'Distributed System Rate Limit Policies', val: 25, color: 'from-purple-500 to-pink-500' },
      ];

  // Use dynamic milestones if available
  const rawMilestones = progress?.milestones || progress?.achievements || [];
  const mappedMilestones = rawMilestones.length > 0
    ? rawMilestones.map((m: any) => ({
        title: m.title,
        level: m.type ? `${m.type.charAt(0) + m.type.slice(1).toLowerCase()} Unlocked` : 'Unlocked',
        description: m.metadata || m.description || 'Achievement recorded'
      }))
    : [
        { title: 'Python Loop Master', level: 'Level 1 Complete', description: 'Wrote sum_squares evaluation script' },
        { title: 'Offline Dictation', level: 'Atlas Speech Sync', description: 'Configured customized 1.0 speech pitch rate parameters' },
        { title: 'Architectural Judge', level: 'Paradigm comparer log', description: 'Assessed functional state purity side-by-side' },
      ];

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-slate-800 flex overflow-hidden font-sans">
      
      {/* Sidebar navigation */}
      <Sidebar userName={userName} />

      {/* Main Content Pane */}
      <main className="flex-1 min-w-0 overflow-y-auto lg:pl-[var(--sidebar-width)] relative z-10">
        
        {/* Mobile top bar */}
        <MobileTopBar title="Progress Tracker" />

        {/* Desktop Top bar */}
        <div className="hidden lg:flex bg-white border-b border-slate-200/80 px-4 md:px-8 py-4 items-center justify-between sticky top-0 z-30 select-none">
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

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10">
          
          {/* Header */}
          <div className="space-y-2 select-none">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest leading-none">Diagnostic Analytics</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Progress Tracker
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-xl">
              Inspect your cognitive growth index over weeks. The offline ledger tracks practice volumes and conceptual retention accuracy.
            </p>
          </div>

          {/* Activity Heatmap Grid Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center select-none">
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider block">Cognitive Practice Heatmap</span>
              <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Activity Index (Past 6 Months)</span>
            </div>

            {/* Heatmap Grid */}
            {isLoading ? (
              <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-500" /></div>
            ) : (
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                <div className="flex flex-col gap-1.5 justify-between pr-2 text-[9px] text-slate-400 font-bold font-mono select-none">
                  <span>Mon</span>
                  <span>Wed</span>
                  <span>Fri</span>
                  <span>Sun</span>
                </div>

                <div className="flex gap-1.5 shrink-0">
                  {getHeatmapGrid().map((column: any[], colIdx: number) => (
                    <div key={colIdx} className="flex flex-col gap-1.5">
                      {column.map((cell: any, rowIdx: number) => {
                        const count = cell.count;
                        const hours = cell.hoursStudied;
                        const dateLabel = cell.date.toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        });

                        let color = 'bg-slate-100'; 
                        if (count >= 5) color = 'bg-cyan-500 shadow-[0_0_4px_rgba(6,182,212,0.25)]';
                        else if (count >= 3) color = 'bg-cyan-400/60';
                        else if (count >= 1) color = 'bg-cyan-200/40';

                        return (
                          <div
                            key={rowIdx}
                            className={`w-3 h-3 rounded smooth-transition hover:scale-125 cursor-crosshair ${color}`}
                            title={`${dateLabel}: ${count} activities, ${hours}h studied`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Grid section: Gauges & Recharts Progression */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Column 1: Diagnostic Mastery Levels */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 space-y-6 shadow-sm">
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider block">Diagnostic Mastery Levels</span>
              
              <div className="space-y-4">
                {mappedGauges.map((skill: any) => {
                  const val = skill.percentage || skill.val || 0;
                  const colorClass = skill.color || 'from-cyan-500 to-blue-500';
                  return (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex justify-between text-xs font-semibold select-none">
                        <span className="text-slate-700 truncate max-w-[80%]">{skill.name}</span>
                        <span className="text-cyan-600 font-bold font-mono">{val}%</span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                        <div 
                          className={`h-full bg-gradient-to-r ${colorClass}`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Recharts Study Progress */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-6 space-y-6 shadow-sm">
              <span className="text-[10px] text-cyan-600 font-bold uppercase tracking-wider block font-mono">Volume Progress: Target vs Practice Hours</span>
              
              {/* Recharts BarChart container */}
              <div className="h-[200px] w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={getWeeklyData()}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderColor: '#cbd5e1',
                        color: '#334155',
                        fontSize: '11px',
                      }} 
                    />
                    <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" />
                    
                    <Bar dataKey="Target" name="Goal target hours" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Practiced" name="Actual hours practiced" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Achievement Badges Area */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-sm">
            <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block select-none">Conceptual Accolades Earned</span>
            
            <div className="flex flex-wrap gap-4 select-none">
              {mappedMilestones.map((badge: any) => (
                <div 
                  key={badge.title}
                  className="flex-1 min-w-[200px] bg-slate-50 border border-slate-200/60 rounded-xl p-4 flex gap-3 items-center hover:border-purple-500/20 smooth-transition"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 p-0.5 shadow-sm flex items-center justify-center shrink-0">
                    <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-cyan-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{badge.title}</h4>
                    <span className="text-[9px] text-cyan-600 font-bold block">{badge.level || badge.type || 'Unlocked'}</span>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5">{badge.description || badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

    </div>
  );
}
