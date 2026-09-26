import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { walletService, WalletBalanceResponse } from '../../services/wallet';
import { transactionService } from '../../services/transactions';
import { Transaction } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { SpendingLineChart } from '../../components/charts/SpendingLineChart';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Wallet,
  PlusCircle,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const WalletPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [balanceData, setBalanceData] = useState<WalletBalanceResponse | null>(null);
  const [walletTxns, setWalletTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [recharging, setRecharging] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');

  const loadWallet = async () => {
    setLoading(true);
    setError('');
    try {
      const [bData, txns] = await Promise.all([
        walletService.getBalance(user?.id),
        transactionService.getTransactions({ user_id: user?.id })
      ]);
      setBalanceData(bData);
      setWalletTxns(txns);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet info');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, [user]);

  const handleRecharge = async (amount: number) => {
    if (!amount || amount <= 0) {
      showToast('error', 'Invalid Amount', 'Please provide a valid recharge sum.');
      return;
    }
    setRecharging(true);
    try {
      const res = await walletService.recharge(amount, user?.id);
      showToast(
        'success',
        'Demo Recharge Credited!',
        `₹${amount.toLocaleString('en-IN')} added to your demo wallet balance.`
      );

      // Trigger celebratory confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      setCustomAmount('');
      await loadWallet();
    } catch (err: any) {
      showToast('error', 'Recharge Failed', err.message);
    } finally {
      setRecharging(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height="h-28" rows={1} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LoadingSkeleton height="h-24" rows={3} />
        </div>
      </div>
    );
  }

  if (error || !balanceData) {
    return <ErrorState message={error} onRetry={loadWallet} />;
  }

  return (
    <div className="space-y-8">
      {/* Kicker Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-xs mb-2">
            DEMO WALLET — NO REAL MONEY
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Digital Wristwatch Wallet
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulated wallet balances for peer transfers and NFC POS terminal payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/send-money')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            Send Money
          </button>
          <button
            onClick={() => navigate('/iot-simulator')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            IoT Simulator
          </button>
        </div>
      </div>

      {/* Balance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Current Balance"
          value={`₹${balanceData.wallet_balance.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`}
          subtitle="Available for instant NFC tap payments & peer transfers"
          icon={Wallet}
          highlight
        />

        <StatCard
          title="Total Spent"
          value={`₹${balanceData.total_spent.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`}
          subtitle="Cumulative debit transactions logged"
          icon={ArrowUpRight}
        />

        <StatCard
          title="Total Received"
          value={`₹${balanceData.total_received.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`}
          subtitle="Inbound funds and demo recharges"
          icon={ArrowDownLeft}
        />
      </div>

      {/* Demo Recharge Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Instant Demo Wallet Recharge</h3>
          <p className="text-xs text-slate-400">
            Top up your virtual test balance. No credit cards or real banking accounts required.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[100, 200, 500, 1000].map((amt) => (
            <button
              key={amt}
              disabled={recharging}
              onClick={() => handleRecharge(amt)}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-slate-200 transition-all font-mono font-bold text-sm text-center flex flex-col items-center justify-center gap-1 group disabled:opacity-50"
            >
              <span className="text-white group-hover:text-indigo-400 transition-colors">
                +₹{amt.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 font-sans font-normal">
                Quick Top-Up
              </span>
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs">
              ₹
            </span>
            <input
              type="number"
              min="1"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="Custom demo amount"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>
          <button
            disabled={recharging || !customAmount}
            onClick={() => handleRecharge(Number(customAmount))}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {recharging ? 'Crediting...' : 'Credit Custom Amount'}
          </button>
        </div>
      </div>

      {/* Spending Trend Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white">Expenditure Trends</h3>
          <p className="text-xs text-slate-400">Weekly spending timeline based on ledger activity</p>
        </div>
        <SpendingLineChart data={balanceData.daily_spending} height={200} />
      </div>

      {/* Wallet Ledger Activity */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <h3 className="text-sm font-semibold text-white">Wallet Transaction Ledger</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">Transaction ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right pr-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {walletTxns.map((t) => {
                const isDebit = t.sender_id === user?.id && t.receiver_id !== user?.id;
                return (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-2 font-mono text-slate-300 font-medium">
                      {t.transaction_id}
                    </td>
                    <td className="py-3">
                      {isDebit ? (
                        <span className="text-rose-400 font-mono text-[11px]">DEBIT</span>
                      ) : (
                        <span className="text-emerald-400 font-mono text-[11px]">CREDIT</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-300 max-w-sm truncate">{t.description}</td>
                    <td
                      className={`py-3 text-right font-mono font-semibold tabular-nums ${
                        isDebit ? 'text-slate-200' : 'text-emerald-400'
                      }`}
                    >
                      {isDebit ? '-' : '+'}₹{t.amount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2
                      })}
                    </td>
                    <td className="py-3 pr-2 text-right font-mono text-slate-500">
                      {new Date(t.timestamp).toLocaleTimeString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
