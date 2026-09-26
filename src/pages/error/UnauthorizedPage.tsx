import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';

export const UnauthorizedPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { quickDemoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-6">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs text-rose-400 uppercase tracking-widest block mb-2">
        Error 403 · Access Forbidden
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Restricted Administrator Zone
      </h1>

      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
        Your current session does not possess root administrative authorization. Switch to the Admin account to inspect this route.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={() => quickDemoLogin('ADMIN').then(() => navigate('/admin'))}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>Elevate to Admin (admin@wristpay.ai)</span>
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
