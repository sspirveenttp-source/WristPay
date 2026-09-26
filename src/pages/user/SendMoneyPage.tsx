import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { walletService } from '../../services/wallet';
import { adminService } from '../../services/admin';
import { User, Transaction } from '../../types';
import {
  Send,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SendMoneyPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [usersList, setUsersList] = useState<User[]>([]);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Success result state
  const [resultTxn, setResultTxn] = useState<Transaction | null>(null);

  useEffect(() => {
    adminService.getUsers().then((list) => {
      // Exclude current user from receiver candidates
      setUsersList(list.filter((u) => u.id !== user?.id));
      if (list.length > 0 && !receiver) {
        const defaultTarget = list.find((u) => u.id !== user?.id);
        if (defaultTarget) setReceiver(defaultTarget.email);
      }
    }).catch(() => {});
  }, [user]);

  const handleSendMoney = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('Please enter a valid amount greater than ₹0.');
      return;
    }

    if (user && user.wallet_balance < numAmount) {
      setErrorMsg(
        `Insufficient balance. Your current balance is ₹${user.wallet_balance.toLocaleString('en-IN')}.`
      );
      return;
    }

    setIsProcessing(true);

    try {
      const res = await walletService.transfer({
        sender_id: user?.id,
        receiver,
        amount: numAmount,
        description: description || 'Peer-to-peer money transfer'
      });

      setResultTxn(res.transaction);
      await refreshUser();

      if (res.dnn_prediction === 'normal') {
        showToast(
          'success',
          'Payment Dispatched!',
          `Transferred ₹${numAmount.toLocaleString('en-IN')} to receiver.`
        );
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.55 }
        });
      } else {
        showToast(
          'warning',
          'Security Anomaly Flagged',
          `DNN evaluated this transaction with ${(res.anomaly_probability * 100).toFixed(1)}% anomaly probability.`
        );
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Transfer failed');
      showToast('error', 'Transfer Failed', err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetForm = () => {
    setResultTxn(null);
    setAmount('');
    setDescription('');
    setErrorMsg('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Send Money</h1>
            <p className="text-xs text-slate-400 mt-1">
              Transfer funds instantly protected by Deep Neural Network anomaly evaluation.
            </p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Available Balance</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
              ₹{user?.wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {resultTxn ? (
        /* Result Screen */
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">
              {resultTxn.status === 'COMPLETED' ? 'Payment Successful' : 'Payment Dispatched (Flagged)'}
            </span>
            <div className="text-4xl font-extrabold text-white font-mono tabular-nums">
              ₹{resultTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400">To {resultTxn.receiver_name}</p>
          </div>

          {/* Transaction Metadata */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono text-slate-200 font-semibold">{resultTxn.transaction_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Security Assessment:</span>
              <span
                className={`font-mono font-semibold ${
                  resultTxn.dnn_prediction === 'normal' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {resultTxn.dnn_prediction.toUpperCase()} ({(resultTxn.anomaly_probability * 100).toFixed(1)}% anomaly risk)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Source Device:</span>
              <span className="font-mono text-slate-300">{resultTxn.device_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Timestamp:</span>
              <span className="font-mono text-slate-300">
                {new Date(resultTxn.timestamp).toLocaleString()}
              </span>
            </div>
            {resultTxn.explanation && (
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-slate-400 block text-[11px] font-semibold mb-0.5">
                  DNN Explanation:
                </span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {resultTxn.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Send Another</span>
            </button>
            <button
              onClick={() => navigate('/transactions')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              View in History
            </button>
          </div>
        </div>
      ) : (
        /* Transfer Form */
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs mb-6">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSendMoney} className="space-y-5">
            {/* Receiver Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Receiver (Email, Phone, Name, or Select User)
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                  placeholder="e.g. priya.sharma@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Quick Select Candidate Pills */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-slate-500">Quick Select:</span>
                {usersList.slice(0, 3).map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setReceiver(u.email)}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors border border-slate-700"
                  >
                    {u.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Transfer Amount (₹)
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm font-semibold">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2.5 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Quick Amount presets */}
              <div className="flex items-center gap-2 mt-2">
                {[100, 250, 500, 2000, 8500].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAmount(String(amt))}
                    className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition-colors"
                  >
                    ₹{amt}
                    {amt >= 8000 && (
                      <span className="text-rose-400 text-[9px] ml-1">(! spike)</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Description / Memo (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dinner share, project parts, etc."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Anomaly Detection Notice */}
            <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/30 text-xs text-indigo-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-200">DNN Automated Verification</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Upon submission, your spending velocity, deviation score, and interval patterns will be evaluated by the neural network prior to settlement.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isProcessing ? 'Evaluating DNN & Sending...' : 'Authorize & Send Money'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
