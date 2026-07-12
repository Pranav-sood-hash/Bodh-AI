import React, { useState, useEffect } from "react";
import { Bell, Mail, ShieldAlert, Check } from "lucide-react";
import { Loader } from "../ui/loader";

interface Preferences {
  learningReminders: boolean;
  roadmapUpdates: boolean;
  projectActivity: boolean;
  achievementUnlocked: boolean;
  aiUsageAlerts: boolean;
  weeklySummary: boolean;
  emailDigest: "Daily" | "Weekly" | "No emails";
}

export default function NotificationsTab() {
  const [prefs, setPrefs] = useState<Preferences>({
    learningReminders: true,
    roadmapUpdates: true,
    projectActivity: true,
    achievementUnlocked: true,
    aiUsageAlerts: false,
    weeklySummary: true,
    emailDigest: "Daily"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchPrefs = async () => {
    try {
      const res = await fetch("/api/user/preferences");
      if (res.ok) {
        const data = await res.json();
        // Adapt fields if needed
        setPrefs({
          learningReminders: data.learningReminders ?? true,
          roadmapUpdates: data.roadmapUpdates ?? true,
          projectActivity: data.projectActivity ?? true,
          achievementUnlocked: data.achievementUnlocked ?? true,
          aiUsageAlerts: data.aiUsageAlerts ?? false,
          weeklySummary: data.weeklySummary ?? true,
          emailDigest: data.emailDigest ?? "Daily"
        });
      }
    } catch (err) {
      console.error("Error loading preferences", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefs();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const savePrefs = async (newPrefs: Preferences) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.preferences) {
          setPrefs(data.preferences);
        }
        triggerToast("Notification preferences saved ✓");
      }
    } catch (err) {
      console.error("Error saving preferences", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof Omit<Preferences, "emailDigest">) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    savePrefs(updated);
  };

  const handleDigestSelect = (level: "Daily" | "Weekly" | "No emails") => {
    const updated = { ...prefs, emailDigest: level };
    setPrefs(updated);
    savePrefs(updated);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader size="md" className="mx-auto" />
      </div>
    );
  }

  const toggleItems = [
    {
      key: "learningReminders",
      title: "Learning Reminders",
      desc: "Get nudged when it's time for your scheduled learning sessions."
    },
    {
      key: "roadmapUpdates",
      title: "Roadmap Updates",
      desc: "Notifications when new modules or paths are added to your focus area."
    },
    {
      key: "projectActivity",
      title: "Project Activity",
      desc: "Updates on active projects, including AI analysis and collaborator comments."
    },
    {
      key: "achievementUnlocked",
      title: "Achievement Unlocked",
      desc: "Celebrate your milestones and newly mastered skills with instant alerts."
    },
    {
      key: "aiUsageAlerts",
      title: "AI Usage Alerts",
      desc: "Notifications regarding your compute usage and model availability."
    },
    {
      key: "weeklySummary",
      title: "Weekly Summary",
      desc: "A comprehensive digest of your productivity and learning metrics."
    }
  ];

  return (
    <div className="space-y-6 relative">
      
      {/* Floating Preferences Saved Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Notification Preferences Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center select-none mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
            <p className="text-slate-500 text-sm mt-0.5">Choose how you want to be alerted about your progress and activities.</p>
          </div>
          {isSaving && (
            <span className="text-[10px] bg-blue-50 border border-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold animate-pulse">
              Saving...
            </span>
          )}
        </div>

        <div className="space-y-4 divide-y divide-slate-100">
          {toggleItems.map((item) => {
            const isChecked = prefs[item.key as keyof Omit<Preferences, "emailDigest">];
            return (
              <div 
                key={item.key} 
                className="flex items-center justify-between py-5 first:pt-0"
              >
                <div className="space-y-0.5 select-none pr-6">
                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">{item.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>

                {/* Custom Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleToggle(item.key as keyof Omit<Preferences, "emailDigest">)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-all duration-200 focus:outline-none flex items-center ${
                    isChecked ? "bg-blue-600 justify-end" : "bg-slate-200 justify-start"
                  }`}
                >
                  <span className="w-5 h-5 bg-white rounded-full shadow-sm" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Digest Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xl font-semibold text-slate-900 select-none">Email Digest</h3>
        <p className="text-slate-500 text-sm mt-0.5 select-none">Control the frequency of automated summary emails.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 select-none">
          
          {/* Daily Card */}
          <div 
            onClick={() => handleDigestSelect("Daily")}
            className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between space-y-3 transition duration-350 ${
              prefs.emailDigest === "Daily" 
                ? "border-2 border-blue-500 bg-blue-50/30 shadow-sm" 
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-900">
                Daily
              </span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                prefs.emailDigest === "Daily" ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300"
              }`}>
                {prefs.emailDigest === "Daily" && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stay on top of every update as it happens.
            </p>
          </div>

          {/* Weekly Card */}
          <div 
            onClick={() => handleDigestSelect("Weekly")}
            className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between space-y-3 transition duration-350 ${
              prefs.emailDigest === "Weekly" 
                ? "border-2 border-blue-500 bg-blue-50/30 shadow-sm" 
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-900">
                Weekly
              </span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                prefs.emailDigest === "Weekly" ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300"
              }`}>
                {prefs.emailDigest === "Weekly" && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The perfect balance for busy professionals.
            </p>
          </div>

          {/* No Emails Card */}
          <div 
            onClick={() => handleDigestSelect("No emails")}
            className={`border rounded-xl p-4 cursor-pointer flex flex-col justify-between space-y-3 transition duration-350 ${
              prefs.emailDigest === "No emails" 
                ? "border-2 border-blue-500 bg-blue-50/30 shadow-sm" 
                : "border-slate-200 hover:border-blue-300"
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-sm font-semibold text-slate-900">
                No emails
              </span>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                prefs.emailDigest === "No emails" ? "border-blue-500 bg-blue-500 text-white" : "border-slate-300"
              }`}>
                {prefs.emailDigest === "No emails" && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manage all notifications within the BodhAI app.
            </p>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => savePrefs(prefs)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 font-medium transition shadow-md"
          >
            Save Notification Settings
          </button>
        </div>
      </div>

    </div>
  );
}
