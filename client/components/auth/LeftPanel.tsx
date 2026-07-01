import React from 'react';
import { Sparkles, Settings, Code2, ShieldAlert, Shield } from 'lucide-react';

interface LeftPanelProps {
  type: 'login' | 'signup' | 'verify' | 'forgot' | 'reset';
}

export default function LeftPanel({ type }: LeftPanelProps) {
  // Gradients for left panels
  const gradients = {
    login: 'from-[#0A1628] to-[#1A3A6B]',
    signup: 'from-[#0D1B2A] to-[#162744]',
    forgot: 'from-[#0A1628] to-[#0D1F3C]',
    verify: 'bg-[#0A1628]',
    reset: 'from-[#0A1628] to-[#0F2040]',
  };

  const currentBgClass = type === 'verify' ? gradients.verify : `bg-gradient-to-br ${gradients[type]}`;

  return (
    <div className={`w-[50%] min-h-screen ${currentBgClass} hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden`}>
      {/* Background ambient lighting */}
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />

      {/* TOP SECTION */}
      <div className="z-10">
        {type === 'login' && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-white/20 overflow-hidden p-0.5">
              <img 
                src="/logo.jpeg" 
                className="w-full h-full object-cover rounded-[10px] scale-[1.65] -translate-x-[18%]" 
                alt="BodhAI Logo" 
              />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">BodhAI</span>
          </div>
        )}

        {type === 'signup' && (
          <div className="flex items-center gap-3 opacity-60">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-white/10 overflow-hidden p-0.5">
              <img 
                src="/logo.jpeg" 
                className="w-full h-full object-cover rounded-[10px] scale-[1.65] -translate-x-[18%]" 
                alt="BodhAI Logo" 
              />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">BodhAI</span>
          </div>
        )}

        {type === 'verify' && (
          <div className="flex flex-col">
            <span className="text-blue-400/40 text-lg font-bold tracking-wider uppercase">BodhAI</span>
            <span className="text-blue-300/30 text-xs font-semibold uppercase tracking-widest mt-0.5">Cognitive Systems</span>
          </div>
        )}

        {type === 'reset' && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-lg overflow-hidden p-0.5">
              <img 
                src="/logo.jpeg" 
                className="w-full h-full object-cover rounded-[10px] scale-[1.65] -translate-x-[18%]" 
                alt="BodhAI Logo" 
              />
            </div>
            <span className="text-white text-xl font-bold tracking-tight">BodhAI</span>
          </div>
        )}

        {type === 'forgot' && null /* Clean, minimal - no logo at top */}
      </div>

      {/* CENTER SECTION */}
      <div className="my-auto z-10 flex flex-col justify-center">
        {type === 'login' && (
          <div className="space-y-10">
            <div className="space-y-2">
              <h1 className="text-5xl font-extrabold tracking-tight leading-none text-white">Learn Faster.</h1>
              <h1 className="text-5xl font-extrabold tracking-tight leading-none text-white">Work Smarter.</h1>
              <h1 className="text-5xl font-extrabold tracking-tight leading-none text-white">Build Better.</h1>
            </div>

            <div className="space-y-6 mt-10">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                  <Sparkles className="text-blue-300 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base leading-tight">Cognitive Acceleration</h4>
                  <p className="text-blue-200/70 text-sm mt-1 leading-relaxed">
                    Advanced AI models tailored to your unique cognitive learning style.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                  <Settings className="text-blue-300 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base leading-tight">Deep Knowledge Graph</h4>
                  <p className="text-blue-200/70 text-sm mt-1 leading-relaxed">
                    Visualize complex connections across disciplines instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-white/10 w-10 h-10 rounded-xl flex items-center justify-center border border-white/10 flex-shrink-0">
                  <Code2 className="text-blue-300 w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-base leading-tight">Elite Execution</h4>
                  <p className="text-blue-200/70 text-sm mt-1 leading-relaxed">
                    Automate your workflow with precision code and logic tools.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {type === 'signup' && (
          <div>
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight text-blue-200/40">Master the flow of</h1>
              <h1 className="text-4xl font-bold tracking-tight text-blue-200/40">information.</h1>
            </div>

            <p className="text-blue-100/60 text-base leading-relaxed mt-8 max-w-md">
              Join a community of scholars and professionals leveraging high-performance AI to reduce mental load and achieve cognitive clarity.
            </p>

            <div className="space-y-5 mt-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-300">
                  <Settings className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-blue-100 font-semibold text-sm">Cognitive Clarity</h4>
                  <p className="text-blue-200/50 text-xs mt-0.5">Structured thinking environments for focused work.</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 text-blue-300">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-blue-100 font-semibold text-sm">Deep Insights</h4>
                  <p className="text-blue-200/50 text-xs mt-0.5">AI-driven analysis that surfaces what truly matters.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {type === 'verify' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-5xl font-extrabold tracking-tight text-white leading-none">Elevating</h1>
              <h1 className="text-5xl font-extrabold tracking-tight text-white leading-none">Human</h1>
              <h1 className="text-5xl font-extrabold tracking-tight text-white leading-none">Intelligence.</h1>
            </div>
            <p className="text-blue-100/60 text-base leading-relaxed max-w-md mt-6">
              A high-performance environment designed for deep focus and scholarly pursuit.
            </p>
          </div>
        )}

        {type === 'forgot' && (
          <div className="text-center px-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">Cognitive Clarity</h1>
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">for Human Intelligence.</h1>
            </div>
            <p className="text-blue-100/60 text-base leading-relaxed mt-6 max-w-sm mx-auto">
              The seamless flow of information designed for modern thinkers, researchers, and professionals.
            </p>

            {/* SYNAPSE / NEURAL SVG ILLUSTRATION */}
            <div className="mt-8 relative w-full max-w-xs mx-auto bg-black/20 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-50" />
              <svg className="w-full h-40 text-blue-400" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Connections */}
                <path d="M20 50 L50 20 M20 50 L50 50 M20 50 L50 80 M50 20 L100 20 M50 50 L100 50 M50 80 L100 80 M100 20 L150 50 M100 50 L150 50 M100 80 L150 50 M150 50 L180 50" stroke="currentColor" strokeWidth="1" strokeDasharray="3,3" opacity="0.3" />
                <path d="M50 20 L100 50 M50 80 L100 50" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                
                {/* Glowing paths */}
                <path d="M20 50 H50 L100 20 H150 L180 50" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
                  <animate attributeName="stroke-dasharray" values="0,200;200,0" dur="3s" repeatCount="indefinite" />
                </path>
                <path d="M20 50 L50 80 L100 50 L150 50 L180 50" stroke="#C084FC" strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
                  <animate attributeName="stroke-dasharray" values="200,0;0,200" dur="4s" repeatCount="indefinite" />
                </path>

                {/* Nodes */}
                <circle cx="20" cy="50" r="4" fill="#3B82F6" className="animate-pulse" />
                <circle cx="50" cy="20" r="4.5" fill="#60A5FA" />
                <circle cx="50" cy="50" r="5" fill="#9333EA" />
                <circle cx="50" cy="80" r="4.5" fill="#F43F5E" />
                <circle cx="100" cy="20" r="5" fill="#10B981" />
                <circle cx="100" cy="50" r="6" fill="#3B82F6" />
                <circle cx="100" cy="80" r="5" fill="#EC4899" />
                <circle cx="150" cy="50" r="5.5" fill="#A855F7" />
                <circle cx="180" cy="50" r="4" fill="#60A5FA" className="animate-pulse" />
              </svg>
              <div className="text-center mt-2 text-[10px] uppercase font-bold tracking-widest text-blue-300/40">
                Active Neural Sync
              </div>
            </div>
          </div>
        )}

        {type === 'reset' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">Cognitive Clarity</h1>
              <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">for Global Minds.</h1>
            </div>
            <p className="text-blue-100/60 text-base leading-relaxed max-w-sm mt-6">
              Your journey towards seamless intelligence continues. Secure your workspace and regain access to your personal cognitive assistant.
            </p>
          </div>
        )}
      </div>

      {/* BOTTOM SECTION */}
      <div className="z-10">
        {type === 'login' && (
          <div className="space-y-5">
            <div className="w-full border-t border-white/10" />
            <div className="flex items-center gap-4">
              {/* Overlapping avatar cluster */}
              <div className="flex items-center -space-x-2">
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-blue-300">AW</div>
                <div className="w-7 h-7 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] font-bold text-purple-300">JD</div>
                <div className="w-7 h-7 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-[10px] font-bold text-pink-300">SK</div>
                <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                  +
                </div>
              </div>
              <span className="text-blue-100/70 text-sm font-medium">
                Trusted by 10,000+ researchers and builders
              </span>
            </div>
          </div>
        )}

        {type === 'signup' && (
          <div className="text-blue-200/30 text-xs">
            © 2024 BodhAI Cognitive Systems. All rights reserved.
          </div>
        )}

        {type === 'verify' && (
          <div className="flex items-center justify-between">
            <span className="text-blue-200/30 text-xs">
              © 2024 BodhAI Cognitive Systems. All rights reserved.
            </span>
            {/* Step Dots */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full border border-blue-400/40 bg-transparent" />
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-md shadow-blue-500/50" />
              <span className="w-2 h-2 rounded-full border border-blue-400/40 bg-transparent" />
            </div>
          </div>
        )}

        {type === 'forgot' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-blue-200/50 text-xs">
              <span className="text-white font-bold text-lg tracking-tight">BodhAI</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-blue-300 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-blue-300 transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-blue-300 transition-colors">Security</a>
                <a href="#" className="hover:text-blue-300 transition-colors">Help Center</a>
              </div>
            </div>
            <div className="text-blue-200/30 text-xs">
              © 2024 BodhAI Cognitive Systems. All rights reserved.
            </div>
          </div>
        )}

        {type === 'reset' && (
          <div className="space-y-5">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-blue-100/60 text-sm">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Enterprise-grade Security</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100/60 text-sm">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>End-to-End Encryption</span>
              </div>
            </div>
            <div className="text-blue-200/30 text-xs mt-4">
              © 2024 BodhAI Cognitive Systems. All rights reserved.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
