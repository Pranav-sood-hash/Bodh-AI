import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface OTPInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onResend: () => void;
  expirySeconds?: number;
  loading?: boolean;
  error?: string;
}

export const OTPInput = ({
  length = 6,
  onComplete,
  onResend,
  expirySeconds = 600,
  loading = false,
  error
}: OTPInputProps) => {
  const [values, setValues] = useState<string[]>(Array(length).fill(''));
  const [timeLeft, setTimeLeft] = useState(expirySeconds);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (secs: number): string => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleChange = (index: number, value: string) => {
    // Strip all non-digits
    const digits = value.replace(/\D/g, '');
    
    // If they typed something but it had no digits (and it's not a backspace), ignore
    if (!digits && value !== '') return;
    
    const newValues = [...values];
    // Take the last typed digit
    newValues[index] = digits.slice(-1);
    setValues(newValues);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    const otp = newValues.join('');
    if (otp.length === length) {
      onComplete(otp);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!values[index] && index > 0) {
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    
    if (!pasted) return;
    
    const newValues = Array(length).fill('');
    pasted.split('').forEach((char, i) => {
      newValues[i] = char;
    });
    setValues(newValues);
    
    const lastIndex = Math.min(pasted.length, length) - 1;
    inputRefs.current[lastIndex]?.focus();
    
    if (pasted.length === length) {
      onComplete(pasted);
    }
  };

  const handleResend = async () => {
    setValues(Array(length).fill(''));
    setTimeLeft(expirySeconds);
    setCanResend(false);
    setResendCooldown(60);
    onResend();
    
    const countdown = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(countdown);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    inputRefs.current[0]?.focus();
  };

  const isExpired = timeLeft <= 0;
  const isNearExpiry = timeLeft > 0 && timeLeft <= 60;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 sm:gap-3 justify-center">
        {values.map((val, index) => (
          <input
            key={index}
            ref={el => inputRefs.current[index] = el}
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={val}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={e => {
              setFocusedIndex(index);
              e.target.select();
            }}
            onBlur={() => setFocusedIndex(null)}
            disabled={loading || isExpired}
            className={`
              w-10 h-12 sm:w-12 sm:h-14 border-2 rounded-xl text-center text-xl sm:text-2xl font-bold outline-none transition-all duration-200
              ${val ? 'border-blue-500 bg-blue-50 text-slate-900' : 'border-slate-200 bg-white text-slate-900'}
              ${focusedIndex === index ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/30' : ''}
              ${error ? 'border-red-400 bg-red-50 animate-shake' : ''}
              ${isExpired ? 'opacity-50 cursor-not-allowed' : ''}
              ${loading ? 'cursor-not-allowed' : 'cursor-text'}
            `}
            autoComplete="one-time-code"
          />
        ))}
      </div>

      {!isExpired && (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span className={`text-sm font-medium font-mono ${isNearExpiry ? 'text-red-500' : 'text-slate-500'}`}>
            {isNearExpiry && '⚠️ '} Code expires in <span className="font-bold">{formatTime(timeLeft)}</span>
          </span>
        </div>
      )}

      {isExpired && (
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600 text-sm font-medium">Code has expired</p>
        </div>
      )}

      {error && (
        <p className="text-center text-red-600 text-sm font-medium">{error}</p>
      )}

      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            className="text-blue-600 text-sm font-medium hover:underline disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : '↻ Resend Code'}
          </button>
        ) : (
          <p className="text-slate-400 text-sm">
            Didn't receive it? <span className="text-slate-500">Resend available after timer ends</span>
          </p>
        )}
      </div>
    </div>
  );
};
