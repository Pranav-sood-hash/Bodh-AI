import React, { useState } from 'react';
import { Eye, EyeOff, Check } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  isValid?: boolean;
  onRightIconClick?: () => void;
  containerClassName?: string;
}

export default function FormInput({
  label,
  leftIcon,
  rightIcon,
  error,
  isValid,
  type = 'text',
  className = '',
  containerClassName = '',
  ...props
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`space-y-1.5 w-full text-slate-900 ${containerClassName}`}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        </div>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-4 text-slate-400 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        <input
          type={inputType}
          className={`w-full bg-white text-slate-900 border text-sm rounded-xl py-3.5 outline-none transition-all duration-200
            ${leftIcon ? 'pl-11' : 'px-4'}
            ${isPassword || rightIcon || isValid ? 'pr-11' : 'pr-4'}
            ${error 
              ? 'border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
              : isValid 
                ? 'border-green-400 focus:border-green-400 focus:ring-2 focus:ring-green-100' 
                : 'border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }
            placeholder:text-slate-400
            ${className}
          `}
          {...props}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors duration-150 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        ) : isValid ? (
          <div className="absolute right-4 text-green-500 pointer-events-none flex items-center justify-center">
            <Check className="w-5 h-5" />
          </div>
        ) : rightIcon ? (
          <div className="absolute right-4 flex items-center justify-center">
            {rightIcon}
          </div>
        ) : null}
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium mt-1 animate-shake">
          {error}
        </p>
      )}
    </div>
  );
}
