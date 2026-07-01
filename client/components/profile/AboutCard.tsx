import React from "react";

interface AboutCardProps {
  profile: any;
}

export default function AboutCard({ profile }: AboutCardProps) {
  if (!profile) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">About</h3>
      
      <p className="text-slate-600 text-sm leading-relaxed mt-3">
        {profile.bio || "No bio added yet."}
      </p>

      <div className="flex flex-wrap gap-2 mt-5">
        {(profile.topics || []).map((topic: string) => (
          <span
            key={topic}
            className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-xs font-medium border border-slate-200"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
