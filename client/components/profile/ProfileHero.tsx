import React from "react";
import { Camera, Calendar, MapPin, Code, TrendingUp, Edit2 } from "lucide-react";

interface ProfileHeroProps {
  profile: any;
  onEditTrigger: () => void;
}

export default function ProfileHero({ profile, onEditTrigger }: ProfileHeroProps) {
  if (!profile) return null;

  const initials = `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase() || "PS";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6 relative">
      
      {/* Cover Banner Cover */}
      <div 
        className="h-36 relative w-full overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 40%, #2563EB 70%, #1E40AF 100%)"
        }}
      >
        {/* Subtle CSS particle/dot overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "8px 8px"
          }}
        />
      </div>

      {/* Avatar Container overlapping the cover banner */}
      <div className="absolute left-8 top-20 flex flex-col items-center">
        <div className="relative">
          <div className="w-28 h-28 rounded-2xl border-4 border-white bg-slate-200 shadow-lg overflow-hidden flex items-center justify-center">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl} 
                alt={`${profile.firstName} ${profile.lastName}`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold uppercase">
                {initials}
              </div>
            )}
          </div>
          
          {/* Edit Camera Button */}
          <button 
            onClick={onEditTrigger}
            className="w-8 h-8 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow absolute bottom-[-4px] right-[-4px] flex items-center justify-center transition-all"
            title="Edit Photo"
          >
            <Camera className="w-4 h-4 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Profile Details Row */}
      <div className="pt-20 px-8 pb-6 flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <div className="flex items-center flex-wrap gap-3">
            <h1 className="text-2xl font-bold text-slate-900 leading-none">
              {profile.firstName} {profile.lastName}
            </h1>
            <span className="inline-flex bg-blue-600 text-white text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold shadow-sm">
              Pro Learner
            </span>
          </div>
          
          <p className="text-slate-500 text-sm mt-1">{profile.email}</p>

          {/* Meta Pills Row */}
          <div className="flex flex-wrap gap-2.5 mt-4">
            <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5 text-slate-600 text-xs font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Joined {profile.joinedDate || "Oct 2023"}</span>
            </div>
            {profile.location && (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5 text-slate-600 text-xs font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.learningGoal && (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5 text-slate-600 text-xs font-medium">
                <Code className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.learningGoal}</span>
              </div>
            )}
            {profile.skillLevel && (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 rounded-full px-3 py-1.5 text-slate-600 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                <span>{profile.skillLevel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Edit button */}
        <button
          onClick={onEditTrigger}
          className="inline-flex items-center gap-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl px-4 py-2 text-sm shadow-sm transition"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Profile
        </button>
      </div>

    </div>
  );
}
