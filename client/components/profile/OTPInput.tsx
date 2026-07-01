import React, { useRef, useEffect, useState } from "react";

interface OTPInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  useEffect(() => {
    // Focus first input on mount
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (!val) return;

    const newValue = [...value];
    // Take only the last character entered
    const char = val.substring(val.length - 1);
    
    if (/^[0-9]$/.test(char)) {
      newValue[index] = char;
      onChange(newValue);
      
      // Auto-advance to next input
      if (index < 5) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newValue = [...value];
      if (value[index]) {
        newValue[index] = "";
        onChange(newValue);
      } else if (index > 0) {
        newValue[index - 1] = "";
        onChange(newValue);
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const newValue = pastedData.split("");
    onChange(newValue);
    inputsRef.current[5]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {value.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputsRef.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => {
            setFocusedIndex(index);
            e.target.select();
          }}
          onBlur={() => setFocusedIndex(null)}
          className={`w-11 h-13 border-2 rounded-xl text-center text-xl font-bold text-slate-800 bg-white outline-none transition-all
            ${digit ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}
            ${focusedIndex === index ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : ''}
          `}
        />
      ))}
    </div>
  );
}
