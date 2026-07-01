import React from 'react';
import { Sliders, RefreshCw, CreditCard, Key, BarChart3, Database } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({ title, value, subtitle, icon, iconBg }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/5 bg-slate-900/30 p-5 space-y-4 backdrop-blur-sm select-none">
      <div className="flex justify-between items-start">
        <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider">{title}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-2xl font-black text-slate-100 tracking-tight font-mono">{value}</h3>
        {subtitle && (
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-none">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function UsageStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Month-to-Date"
        value="1,249,812"
        subtitle="Total Tokens Processed"
        icon={<Database className="w-4 h-4 text-emerald-400" />}
        iconBg="bg-emerald-500/10 border border-emerald-500/20"
      />
      <StatCard
        title="Avg. Response"
        value="184ms"
        subtitle="Latency across nodes"
        icon={<RefreshCw className="w-4 h-4 text-blue-400 animate-spin-slow" />}
        iconBg="bg-blue-500/10 border border-blue-500/20"
      />
      <StatCard
        title="Estimated Spend"
        value="$12.40"
        subtitle="Projected: $18.50"
        icon={<CreditCard className="w-4 h-4 text-purple-400" />}
        iconBg="bg-purple-500/10 border border-purple-500/20"
      />
    </div>
  );
}

interface StatMiniCardProps {
  label: string;
  value: string | number;
}

export function MiniUsageDashboard() {
  const stats = [
    { label: 'Active Keys', value: '1' },
    { label: 'Est. Monthly Cost', value: '$12.40' },
    { label: 'Tokens Consumed', value: '1.2M' },
    { label: 'Requests/Day', value: '342' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {stats.map((stat, i) => (
        <div key={i} className="rounded-xl border border-white/5 bg-slate-900/20 p-4 backdrop-blur-sm">
          <span className="block text-[9px] text-slate-500 font-extrabold uppercase tracking-widest">{stat.label}</span>
          <p className="text-xl font-black text-slate-100 font-mono tracking-tight mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
