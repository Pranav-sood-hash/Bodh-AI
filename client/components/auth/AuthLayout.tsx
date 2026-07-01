import React from 'react';
import LeftPanel from './LeftPanel';

interface AuthLayoutProps {
  type: 'login' | 'signup' | 'verify' | 'forgot' | 'reset';
  children: React.ReactNode;
}

export default function AuthLayout({ type, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Left Branding Panel (Desktop Only) */}
      <LeftPanel type={type} />

      {/* Right Form Panel (Full screen on mobile, 50% on desktop) */}
      <div className="w-full lg:w-[50%] min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6 sm:px-12 lg:px-16 relative">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center h-full min-h-[inherit]">
          {/* Mobile Logo Header */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-start">
            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-200 shadow-sm overflow-hidden p-0.5">
              <img 
                src="/logo.jpeg" 
                className="w-full h-full object-cover rounded-md scale-[1.65] -translate-x-[18%]" 
                alt="BodhAI Logo" 
              />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">BodhAI</span>
          </div>

          {/* Form Content */}
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
