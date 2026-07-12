import React, { useState, useEffect } from "react";
import { Monitor, Smartphone, ShieldCheck } from "lucide-react";
import { Loader } from "../ui/loader";

interface Session {
  id: string;
  device: string;
  location: string;
  ip: string;
  isCurrent: boolean;
  lastActive: string;
}

export default function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/user/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error("Failed to load sessions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const handleRevoke = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to revoke this login session?");
    if (!confirmed) return;

    setRevokingId(id);
    try {
      const res = await fetch(`/api/user/sessions/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== id));
        triggerToast("Session revoked successfully ✓");
      } else {
        alert("Failed to revoke session");
      }
    } catch (err) {
      console.error(err);
      alert("Error revoking session");
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOthers = async () => {
    const confirmed = window.confirm("Are you sure you want to revoke all other sessions?");
    if (!confirmed) return;

    setRevokingAll(true);
    try {
      // Find all session ids other than the current one
      const otherSessions = sessions.filter(s => !s.isCurrent);
      
      // Revoke them in parallel using individual DELETE requests
      await Promise.all(
        otherSessions.map(async (s) => {
          await fetch(`/api/user/sessions/${s.id}`, { method: "DELETE" });
        })
      );
      
      // Keep only current session in state
      setSessions((prev) => prev.filter((s) => s.isCurrent));
      triggerToast("All other sessions revoked successfully ✓");
    } catch (err) {
      console.error("Failed to revoke all other sessions", err);
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-5 relative">
      {/* Floating Success Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 select-none mb-4">
        <div className="flex items-center gap-2">
          <Monitor className="w-5 h-5 text-slate-700" />
          <h3 className="text-xl font-semibold text-slate-900">Active Sessions</h3>
        </div>
        {sessions.filter(s => !s.isCurrent).length > 0 && (
          <button
            type="button"
            onClick={handleRevokeAllOthers}
            disabled={revokingAll}
            className="border border-red-300 text-red-600 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-red-50 disabled:bg-slate-100 disabled:text-slate-400 transition"
          >
            {revokingAll ? "Revoking..." : "Revoke All Other Sessions"}
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader size="md" className="mx-auto" />
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => {
            const isMobile = session.device.toLowerCase().includes("android") || session.device.toLowerCase().includes("iphone") || session.device.toLowerCase().includes("phone");
            
            return (
              <div 
                key={session.id} 
                className="border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50/50 transition duration-300"
              >
                
                {/* Icon + Information */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0">
                    {isMobile ? (
                      <Smartphone className="w-5 h-5 text-slate-600" />
                    ) : (
                      <Monitor className="w-5 h-5 text-slate-600" />
                    )}
                  </div>
                  
                  <div className="space-y-0.5 select-none">
                    <span className="text-sm font-semibold text-slate-900 block leading-snug">
                      {session.device}
                    </span>
                    <p className="text-xs text-slate-500 font-medium">
                      {session.location} · {session.ip}
                    </p>
                  </div>
                </div>

                {/* Right side status / revoke action */}
                <div className="flex flex-col items-end select-none">
                  {session.isCurrent ? (
                    <>
                      <span className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-medium">
                        CURRENT
                      </span>
                      <span className="text-xs text-slate-400 mt-1">Active now</span>
                    </>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">
                        {session.lastActive}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRevoke(session.id)}
                        disabled={revokingId === session.id}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:bg-red-50 rounded-lg px-2.5 py-1.5 transition"
                      >
                        {revokingId === session.id ? "Revoking..." : "Revoke"}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
