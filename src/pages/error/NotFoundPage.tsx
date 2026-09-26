import React from 'react';
import { Watch, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
        <Watch className="w-8 h-8" />
      </div>

      <span className="font-mono text-xs text-indigo-400 uppercase tracking-widest block mb-2">
        Error 404 · Route Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
        Lost in Transaction Space
      </h1>

      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-8 leading-relaxed">
        The route you are navigating to does not exist or has been relocated within the prototype architecture.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Landing Page</span>
        </button>
      </div>
    </div>
  );
};
