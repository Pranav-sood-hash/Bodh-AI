import React from 'react';
import { Menu } from 'lucide-react';

interface MobileTopBarProps {
  title?: string;
  rightSlot?: React.ReactNode;
}

/**
 * Shown only on mobile (lg:hidden). Renders a hamburger button that opens
 * the sidebar drawer (via the window.__sidebarOpen() global set by Sidebar).
 */
export default function MobileTopBar({ title = 'BodhAI', rightSlot }: MobileTopBarProps) {
  return (
    <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-30 select-none">
      <button
        onClick={() => (window as any).__sidebarOpen?.()}
        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition flex-shrink-0"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">B</div>
        <span className="font-bold text-slate-800 text-sm truncate">{title}</span>
      </div>
      {rightSlot && <div className="ml-auto flex items-center gap-1">{rightSlot}</div>}
    </div>
  );
}
