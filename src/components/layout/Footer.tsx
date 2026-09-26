import React from 'react';

export const Footer: React.FC<{ navigate?: (path: string) => void }> = ({ navigate }) => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/60 py-6 px-4 lg:px-8 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-semibold text-slate-400">WristPay AI</span>
          <span className="mx-2">·</span>
          <span>IoT Cashless Money Transfer Wristwatch with DNN Anomaly Detection</span>
          <span className="block text-[11px] text-slate-600 mt-0.5">
            Engineering Prototype · Academic & Startup Demonstration · No Real Currency Processed
          </span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          {navigate && (
            <>
              <button onClick={() => navigate('/')} className="hover:text-slate-200 transition-colors">
                Landing
              </button>
              <button onClick={() => navigate('/ai-security')} className="hover:text-slate-200 transition-colors">
                DNN Model
              </button>
              <button onClick={() => navigate('/iot-simulator')} className="hover:text-slate-200 transition-colors">
                IoT Simulator
              </button>
              <button onClick={() => navigate('/settings')} className="hover:text-slate-200 transition-colors">
                Settings
              </button>
            </>
          )}
          <span className="text-[11px] font-mono text-slate-600">v1.0.0-PROTOTYPE</span>
        </div>
      </div>
    </footer>
  );
};
