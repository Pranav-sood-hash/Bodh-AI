import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, Check } from 'lucide-react';

interface DangerZoneProps {
  onRevokeAll: () => void;
}

export default function DangerZone({ onRevokeAll }: DangerZoneProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleConfirmRevoke = () => {
    onRevokeAll();
    setSuccess(true);
    setShowConfirmation(false);
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <>
      <div className="rounded-2xl border border-red-500/20 bg-red-950/5 p-6 space-y-6 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full blur-[40px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-sm font-black text-red-400 uppercase tracking-widest flex items-center gap-2 select-none">
              <AlertOctagon className="w-4 h-4 text-red-500" />
              Danger Zone
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Immediate cessation of all AI services. This will clear all stored provider keys from the BodhAI cloud vault and disconnect your active learning sessions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowConfirmation(true)}
            className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl smooth-transition shrink-0 shadow-[0_4px_15px_rgba(239,68,68,0.2)] hover:shadow-[0_4px_25px_rgba(239,68,68,0.45)] active:scale-[0.98]"
          >
            Revoke All Keys
          </button>
        </div>

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs font-bold uppercase tracking-wider animate-fade-in">
            <Check className="w-4 h-4" />
            All connected API keys have been securely revoked!
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Warning header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">Revoke Stored Credentials?</h4>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Critical confirmation required</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Are you sure you want to delete all stored API keys? This action cannot be undone and will immediately disable all reasoning assistants, code evaluators, and learning trackers until a new key is connected.
            </p>

            {/* Triggers */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmation(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-200 smooth-transition uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevoke}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl smooth-transition"
              >
                Yes, Revoke All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
