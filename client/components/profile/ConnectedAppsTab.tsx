import React, { useState } from "react";
import { Loader } from "../ui/loader";

interface AppIntegration {
  id: string;
  name: string;
  desc: string;
  iconLetter: string;
  iconBg: string;
  iconColor: string;
  isConnected: boolean;
}

export default function ConnectedAppsTab() {
  const [integrations, setIntegrations] = useState<AppIntegration[]>([
    { id: "1", name: "Google SSO", desc: "For seamless single-sign on logins", iconLetter: "G", iconBg: "bg-red-50", iconColor: "text-red-500", isConnected: true },
    { id: "2", name: "Cloudinary", desc: "For secure hosting of custom avatars and build photos", iconLetter: "C", iconBg: "bg-blue-50", iconColor: "text-blue-500", isConnected: true },
    { id: "3", name: "GitHub Accounts", desc: "Sync repositories, code helpers, and build trackers", iconLetter: "H", iconBg: "bg-slate-100", iconColor: "text-slate-800", isConnected: false },
    { id: "4", name: "Slack Notifications", desc: "Send daily learning digests to your Slack channel", iconLetter: "S", iconBg: "bg-yellow-50", iconColor: "text-yellow-600", isConnected: false }
  ]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const toggleConnection = async (id: string, isConnected: boolean) => {
    setLoadingId(id);
    // Mock network latency for oauth syncing
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    setIntegrations((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isConnected: !isConnected } : item))
    );
    setLoadingId(null);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-slate-900 select-none">Connected Applications</h3>
      <p className="text-slate-500 text-sm mt-0.5 select-none">Sync your favorite platforms to extend BodhAI's feature ecosystem.</p>

      <div className="mt-6 space-y-4 divide-y divide-slate-100">
        {integrations.map((app, idx) => (
          <div 
            key={app.id} 
            className={`flex items-center justify-between py-4.5 ${idx === 0 ? "pt-0" : ""}`}
          >
            <div className="flex items-center gap-4 pr-4 select-none">
              <div className={`w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm text-lg font-black font-sans flex-shrink-0 ${app.iconBg} ${app.iconColor}`}>
                {app.iconLetter}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800 leading-snug">{app.name}</h4>
                  {app.isConnected && (
                    <span className="inline-flex bg-green-50 text-green-700 text-[8px] font-bold px-1.5 py-0.5 rounded border border-green-200 uppercase tracking-wider">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{app.desc}</p>
              </div>
            </div>

            {/* Connection Toggle Action button */}
            <button
              type="button"
              disabled={loadingId === app.id}
              onClick={() => toggleConnection(app.id, app.isConnected)}
              className={`text-xs font-semibold rounded-xl px-4 py-2 transition min-w-[96px] flex items-center justify-center ${
                app.isConnected
                  ? "text-red-500 border border-red-200 hover:bg-red-50"
                  : "text-blue-600 border border-blue-200 hover:bg-blue-50"
              }`}
            >
              {loadingId === app.id ? (
                <Loader size="sm" />
              ) : app.isConnected ? (
                "Disconnect"
              ) : (
                "Connect"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
