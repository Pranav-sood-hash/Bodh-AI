import React, { useState } from "react";
import { AlertCircle, X } from "lucide-react";
import { Loader } from "../ui/loader";
import { useNavigate } from "react-router-dom";

export default function DangerZone() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE"
      });
      if (res.ok) {
        setIsModalOpen(false);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        alert("Account deleted successfully.");
        navigate("/login");
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-red-200 rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4 select-none">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <h3 className="text-xl font-bold text-red-600">Danger Zone</h3>
        </div>

        {/* Content row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="select-none">
            <span className="font-semibold text-slate-900 block text-base">Delete Account</span>
            <p className="text-sm text-slate-500 mt-1">
              Permanently remove your account, all research projects, and mastery progress. This action cannot be undone.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium transition whitespace-nowrap"
          >
            Delete My Account
          </button>
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative p-8">
            
            <button 
              onClick={() => {
                setIsModalOpen(false);
                setConfirmText("");
                setError("");
              }} 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Delete Your Account?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                This will permanently delete all your data including chats, projects, roadmaps, and progress. This cannot be undone.
              </p>
            </div>

            <div className="mt-6 space-y-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block select-none">
                Type DELETE to confirm:
              </label>
              <input
                type="text"
                placeholder="Type DELETE here"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full border border-slate-300 focus:border-red-500 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-red-500 transition-all font-mono text-center font-bold"
              />
              {error && <p className="text-xs text-red-500 font-semibold text-center mt-1">{error}</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setConfirmText("");
                  setError("");
                }}
                disabled={isLoading}
                className="flex-1 border border-slate-300 rounded-xl py-2.5 text-slate-700 text-sm font-semibold transition hover:bg-slate-50"
              >
                Cancel
              </button>
              
              <button
                type="button"
                disabled={confirmText !== "DELETE" || isLoading}
                onClick={handleDeleteAccount}
                className={`flex-1 rounded-xl py-2.5 text-sm font-medium transition shadow-md flex items-center justify-center gap-1.5 ${
                  confirmText === "DELETE"
                    ? "bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isLoading ? (
                  <>
                    <Loader size="sm" /> Deleting...
                  </>
                ) : (
                  "Permanently Delete Account"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
