import React, { useState, useEffect } from "react";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck, X } from "lucide-react";
import OTPInput from "./OTPInput";

interface ChangeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onSuccess: (newEmail: string) => void;
}

type Step = "EMAIL" | "OTP" | "SUCCESS";

export default function ChangeEmailModal({ isOpen, onClose, currentEmail, onSuccess }: ChangeEmailModalProps) {
  const [step, setStep] = useState<Step>("EMAIL");
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(585); // 9:45 (585 seconds)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step === "OTP") {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step]);

  if (!isOpen) return null;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      setError("Please enter a valid email address");
      return;
    }
    if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      setError("Cannot be same as current email");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }
      
      setStep("OTP");
      setTimer(585); // reset timer to 09:45
      setOtp(Array(6).fill(""));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all 6 digits of the verification code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail, code: otpCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setStep("SUCCESS");
      onSuccess(newEmail);
      setTimeout(() => {
        onClose();
        setStep("EMAIL");
        setNewEmail("");
        setOtp(Array(6).fill(""));
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/change-email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to resend code");
      }
      
      setTimer(585);
      setOtp(Array(6).fill(""));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative p-8">
        
        {step !== "SUCCESS" && (
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {step === "EMAIL" && (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Change Email Address</h3>
              <p className="text-slate-500 text-sm mt-2">
                Enter your new email. We'll send a verification code to confirm it.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Current Email
                </label>
                <input
                  type="text"
                  readOnly
                  value={currentEmail}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  New Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                  <input
                    type="email"
                    required
                    placeholder="new@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full border border-slate-300 focus:border-blue-500 rounded-xl pl-12 pr-4 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                {error && <p className="text-xs text-red-500 font-medium mt-1">{error}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-3 font-semibold transition-all shadow-md"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold flex items-center justify-center gap-1.5 py-1.5"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {step === "OTP" && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 relative">
                <ShieldCheck className="w-6 h-6" />
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full absolute top-1 right-1 animate-ping" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Verify New Email</h3>
              <p className="text-slate-500 text-sm mt-2">
                We sent a 6-digit code to:<br />
                <span className="font-semibold text-slate-800">{newEmail}</span>
              </p>
            </div>

            <div className="space-y-4">
              <OTPInput value={otp} onChange={setOtp} />
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">
                  Code expires in: <span className="text-blue-600 font-mono font-bold">{formatTime(timer)}</span>
                </span>
                <button
                  type="button"
                  disabled={timer > 0 || isLoading}
                  onClick={handleResend}
                  className="text-blue-600 hover:text-blue-800 font-bold disabled:text-slate-400 disabled:cursor-not-allowed transition"
                >
                  Resend Code
                </button>
              </div>

              {error && <p className="text-xs text-red-500 font-medium text-center">{error}</p>}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl py-3 font-semibold transition-all shadow-md"
              >
                {isLoading ? "Verifying..." : "Verify & Update Email"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep("EMAIL");
                  setError("");
                }}
                className="w-full text-slate-500 hover:text-slate-700 text-sm font-semibold flex items-center justify-center gap-1.5 py-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Edit email address
              </button>
            </div>
          </form>
        )}

        {step === "SUCCESS" && (
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Email Updated!</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your email has been changed to:<br />
              <span className="font-semibold text-slate-800">{newEmail}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-2.5 text-sm font-semibold shadow-md transition"
            >
              Go to Profile →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
