import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, Check, X, ShieldAlert } from "lucide-react";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  
  const [strength, setStrength] = useState(0); // 0 to 4
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    special: false,
    number: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });

  useEffect(() => {
    // Validate requirements
    const reqs = {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
      number: /[0-9]/.test(newPassword)
    };
    setRequirements(reqs);

    // Calculate strength based on satisfied criteria
    let score = 0;
    if (newPassword.length > 0) {
      if (reqs.length) score++;
      if (reqs.uppercase) score++;
      if (reqs.special) score++;
      if (reqs.number) score++;
    }
    setStrength(score);
  }, [newPassword]);

  const toggleVisibility = (field: "current" | "new" | "confirm") => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const getStrengthLabel = () => {
    if (strength === 0) return { label: "Very Weak", color: "text-slate-400", bg: "bg-slate-200" };
    if (strength === 1) return { label: "Weak", color: "text-red-500", bg: "bg-red-500" };
    if (strength === 2) return { label: "Fair", color: "text-orange-500", bg: "bg-orange-500" };
    if (strength === 3) return { label: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500" };
    return { label: "Strong", color: "text-green-600", bg: "bg-green-600" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    // Validate confirmation matches
    if (newPassword !== confirmPassword) {
      setStatus({ type: "error", message: "New passwords do not match" });
      return;
    }

    // Validate all requirements are met
    const allMet = Object.values(requirements).every(Boolean);
    if (!allMet) {
      setStatus({ type: "error", message: "Password does not meet all requirements" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setStatus({ type: "success", message: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const strDetails = getStrengthLabel();

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900 select-none">Change Password</h3>
      <p className="text-slate-500 text-sm mt-0.5 select-none">
        Update your account password to maintain absolute credentials safety.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Form Inputs (Left side) */}
        <div className="space-y-4">
          
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Current Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type={showPass.current ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full border border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-11 py-3 text-slate-800 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("current")}
                className="text-slate-400 hover:text-slate-600 absolute right-4 top-3.5 transition"
              >
                {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type={showPass.new ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-11 py-3 text-slate-800 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("new")}
                className="text-slate-400 hover:text-slate-600 absolute right-4 top-3.5 transition"
              >
                {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
              <input
                type={showPass.confirm ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-11 py-3 text-slate-800 focus:outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => toggleVisibility("confirm")}
                className="text-slate-400 hover:text-slate-600 absolute right-4 top-3.5 transition"
              >
                {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {status.message && (
            <div 
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                status.type === "success" 
                  ? "bg-green-50 text-green-700 border border-green-200" 
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {status.type === "error" && <ShieldAlert className="w-4 h-4 flex-shrink-0" />}
              <span>{status.message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-6 py-3 font-semibold transition shadow-md w-full md:w-auto"
          >
            {isLoading ? "Saving..." : "Update Password"}
          </button>

        </div>

        {/* Requirements Checklist (Right side) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
              Password Requirements
            </h4>
            
            <div className="space-y-2 select-none">
              
              {/* Length */}
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  requirements.length ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"
                }`}>
                  {requirements.length ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                </span>
                <span className={`text-xs ${requirements.length ? "text-slate-700" : "text-slate-400"}`}>
                  At least 8 characters long
                </span>
              </div>

              {/* Uppercase */}
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  requirements.uppercase ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"
                }`}>
                  {requirements.uppercase ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                </span>
                <span className={`text-xs ${requirements.uppercase ? "text-slate-700" : "text-slate-400"}`}>
                  At least one uppercase letter (A-Z)
                </span>
              </div>

              {/* Special Char */}
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  requirements.special ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"
                }`}>
                  {requirements.special ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                </span>
                <span className={`text-xs ${requirements.special ? "text-slate-700" : "text-slate-400"}`}>
                  At least one special character (!@#$)
                </span>
              </div>

              {/* Number */}
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  requirements.number ? "bg-green-100 text-green-600" : "bg-slate-200 text-slate-400"
                }`}>
                  {requirements.number ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                </span>
                <span className={`text-xs ${requirements.number ? "text-slate-700" : "text-slate-400"}`}>
                  At least one number (0-9)
                </span>
              </div>

            </div>
          </div>

          {/* Strength Meter Grid */}
          <div className="space-y-2 select-none border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Password Strength:</span>
              <span className={`font-bold ${strDetails.color}`}>{strDetails.label}</span>
            </div>
            
            {/* 4 strength segments */}
            <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full ${strength >= 1 ? strDetails.bg : "bg-transparent"}`} />
              <div className={`h-full ${strength >= 2 ? strDetails.bg : "bg-transparent"}`} />
              <div className={`h-full ${strength >= 3 ? strDetails.bg : "bg-transparent"}`} />
              <div className={`h-full ${strength >= 4 ? strDetails.bg : "bg-transparent"}`} />
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}
