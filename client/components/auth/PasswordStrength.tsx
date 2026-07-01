import React from 'react';
import { Check, Circle } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

export default function PasswordStrength({
  password,
  showRequirements = true
}: PasswordStrengthProps) {
  // Assessment rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const criteria = [
    { label: "8+ characters", met: hasMinLength },
    { label: "1 special char", met: hasSpecialChar },
    { label: "1 uppercase", met: hasUppercase },
    { label: "1 number", met: hasNumber },
  ];

  // Calculate scores
  const score = criteria.filter(c => c.met).length;

  const getStrengthLabel = (score: number) => {
    if (!password) return { label: '', colorClass: 'text-slate-400', barColor: 'bg-slate-200' };
    switch (score) {
      case 1:
        return { label: 'Weak', colorClass: 'text-red-500', barColor: 'bg-red-500' };
      case 2:
        return { label: 'Fair', colorClass: 'text-orange-400', barColor: 'bg-orange-400' };
      case 3:
        return { label: 'Strong', colorClass: 'text-green-500', barColor: 'bg-green-500' };
      case 4:
        return { label: 'Very Strong', colorClass: 'text-green-600', barColor: 'bg-green-600' };
      default:
        return { label: '', colorClass: 'text-slate-400', barColor: 'bg-slate-200' };
    }
  };

  const strength = getStrengthLabel(score);

  return (
    <div className="w-full mt-2">
      {/* 4-segment strength bar */}
      <div className="flex gap-1.5 w-full">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full w-1/4 transition-colors duration-300
              ${i < score 
                ? strength.barColor 
                : 'bg-slate-200'
              }
            `}
          />
        ))}
      </div>

      {/* Strength Label Row */}
      {password && (
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Strength</span>
          <span className={`text-xs font-semibold ${strength.colorClass}`}>
            {strength.label}
          </span>
        </div>
      )}

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3">
          {criteria.map((item, index) => (
            <div key={index} className="flex items-center gap-2 select-none">
              {item.met ? (
                <div className="w-4 h-4 bg-green-50 rounded-full flex items-center justify-center flex-shrink-0 text-green-500">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-slate-300">
                  <Circle className="w-3 h-3 fill-slate-50 stroke-[1.5]" />
                </div>
              )}
              <span className={`text-xs transition-colors duration-200 ${item.met ? 'text-slate-600 font-medium' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
