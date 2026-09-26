import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { useToast } from '../../context/ToastContext';
import { Watch, Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('demo@wristpay.ai');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMsg, setResponseMsg] = useState<{ message: string; demo_password?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(email);
      setResponseMsg(res);
      showToast('info', 'Password Reset Request', res.message);
    } catch (err: any) {
      showToast('error', 'Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 cursor-pointer mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Watch className="w-5 h-5" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            WristPay <span className="text-indigo-400">AI</span>
          </span>
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">Recover your password</h2>
        <p className="mt-1 text-xs text-slate-400">
          Demo Mode simulates instant password retrieval for evaluation
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          {responseMsg ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Demo Mode Recovery Success</span>
                </div>
                <p>{responseMsg.message}</p>
                {responseMsg.demo_password && (
                  <div className="mt-2 p-2 bg-slate-950 rounded border border-emerald-800/60 font-mono text-white text-xs">
                    Password: <span className="text-amber-400">{responseMsg.demo_password}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Return to Login</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="demo@wristpay.ai"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Retrieving...' : 'Recover Demo Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-2 text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
