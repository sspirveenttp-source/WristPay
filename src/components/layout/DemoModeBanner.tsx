import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { user, quickDemoLogin } = useAuth();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-slate-300">
      <div className="flex items-center gap-2 font-mono">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold tracking-wide text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          DEMO MODE
        </span>
        <span className="text-slate-400 hidden sm:inline">|</span>
        <span className="text-slate-400">PROTOTYPE — NO REAL MONEY</span>
        <span className="text-slate-500 hidden md:inline">·</span>
        <span className="text-slate-500 hidden md:inline">ESP32 + NFC REST Hardware Emulation</span>
      </div>

      <div className="flex items-center gap-2 ml-auto text-xs">
        <span className="text-slate-400 hidden lg:inline">Active Session:</span>
        <span className="font-semibold text-slate-200">
          {user ? `${user.name} (${user.role})` : 'Guest'}
        </span>

        {user?.role === 'ADMIN' ? (
          <button
            onClick={() => quickDemoLogin('USER')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Switch to Demo Standard User (Alex Rivera)"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch to Demo User</span>
          </button>
        ) : (
          <button
            onClick={() => quickDemoLogin('ADMIN')}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border border-indigo-700/50 transition-colors font-medium"
            title="Switch to Admin Role"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Switch to Admin</span>
          </button>
        )}
      </div>
    </div>
  );
};
