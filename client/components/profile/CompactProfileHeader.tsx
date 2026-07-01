import React from "react";
import { Edit2, MapPin, Code, TrendingUp, Calendar } from "lucide-react";

interface CompactProfileHeaderProps {
  tab: string;
  onEditTrigger: () => void;
  profile: any;
}

export default function CompactProfileHeader({ tab, onEditTrigger, profile }: CompactProfileHeaderProps) {
  if (!profile) return null;

  const name = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase();
  const joined = `Joined ${profile.joinedDate || "Oct 2023"}`;

  // Choose subtitle based on tab context
  let subtitle = "";
  if (tab === "security") {
    subtitle = "Manage your account security and active sessions";
  } else if (tab === "notifications") {
    subtitle = "Customize how and when BodhAI notifies you";
  } else if (tab === "connected-apps") {
    subtitle = "Manage connected platforms and integrations";
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6 shadow-sm">
      {/* Compact blue gradient banner */}
      <div
        className="h-20 w-full"
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #2563EB 70%, #1E40AF 100%)"
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "8px 8px"
          }}
        />
      </div>

      {/* Profile row that sits below / overlapping banner */}
      <div className="px-6 pt-0 pb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 -mt-7">
        <div className="flex items-end gap-4">
          {/* Avatar overlapping banner */}
          <div className="w-16 h-16 rounded-xl border-4 border-white bg-slate-100 overflow-hidden flex items-center justify-center shadow-lg flex-shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold uppercase">
                {initials}
              </div>
            )}
          </div>

          {/* Name + subtitle */}
          <div className="pb-1">
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{subtitle}</p>
            {/* Meta pills row */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                {joined}
              </span>
              {profile.location && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {profile.location}
                </span>
              )}
              {profile.learningGoal && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <Code className="w-3 h-3" />
                  {profile.learningGoal}
                </span>
              )}
              {profile.skillLevel && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                  <TrendingUp className="w-3 h-3" />
                  {profile.skillLevel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile button */}
        <button
          onClick={onEditTrigger}
          className="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl px-4 py-2 text-sm shadow-sm transition flex-shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>
    </div>
  );
}
