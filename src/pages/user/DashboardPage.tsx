import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { walletService, WalletBalanceResponse } from '../../services/wallet';
import { transactionService } from '../../services/transactions';
import { Transaction } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { SpendingLineChart } from '../../components/charts/SpendingLineChart';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Wallet,
  Send,
  PlusCircle,
  Watch,
  Receipt,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Cpu,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const [balanceData, setBalanceData] = useState<WalletBalanceResponse | null>(null);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bData, txns] = await Promise.all([
        walletService.getBalance(user?.id),
        transactionService.getTransactions({ user_id: user?.id })
      ]);
      setBalanceData(bData);
      setRecentTxns(txns.slice(0, 5));
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height="h-28" rows={1} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <LoadingSkeleton height="h-24" rows={3} />
        </div>
        <LoadingSkeleton height="h-64" rows={1} />
      </div>
    );
  }

  if (error || !balanceData) {
    return <ErrorState message={error} onRetry={loadDashboardData} />;
  }

  const normalTxnCount = recentTxns.filter((t) => t.dnn_prediction === 'normal').length;
  const suspiciousTxnCount = recentTxns.filter((t) => t.dnn_prediction === 'suspicious').length;
  const normalRate = recentTxns.length > 0 ? (normalTxnCount / recentTxns.length) * 100 : 98.4;

  const currentHour = new Date().getHours();
  let greeting = 'Good morning';
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good afternoon';
  else if (currentHour >= 17) greeting = 'Good evening';

  return (
    <div className="space-y-8">
      {/* Top Greeting & Device Telemetry Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Paired Wristwatch: {balanceData.wristwatch_id} · ESP32 Online</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {greeting}, {user?.name || 'Explorer'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time balance, neural network anomaly defense, and NFC transaction control.
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/send-money')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Money</span>
          </button>
          <button
            onClick={() => navigate('/wallet')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Demo Money</span>
          </button>
          <button
            onClick={() => navigate('/iot-simulator')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-medium transition-colors"
            title="Open IoT Smartwatch & NFC POS Terminal Simulator"
          >
            <Watch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">IoT Simulator</span>
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Available Balance"
          value={`₹${balanceData.wallet_balance.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`}
          subtitle="Real-time prototype balance available for NFC smartwatch taps"
          icon={Wallet}
          highlight
        />

        <StatCard
          title="Total Spent"
          value={`₹${balanceData.total_spent.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`}
          subtitle="Aggregate money transferred and POS canteen payments"
          icon={ArrowUpRight}
        />

        <StatCard
          title="Total Received"
          value={`₹${balanceData.total_received.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}`}
          subtitle="Incoming peer-to-peer transfers & wallet credits"
          icon={ArrowDownLeft}
        />
      </div>

      {/* Middle Row: Spending Analytics + DNN Security Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spending Analytics */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Daily Spending Activity</h3>
              <p className="text-xs text-slate-400">7-day transaction expenditure breakdown (₹)</p>
            </div>
            <button
              onClick={() => navigate('/wallet')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              <span>Wallet Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <SpendingLineChart data={balanceData.daily_spending} height={190} />
        </div>

        {/* DNN Security Card */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">
                Transaction Security
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {normalRate.toFixed(1)}%
              </span>
              <span className="text-xs font-semibold text-emerald-400 font-mono">Normal</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every incoming & outgoing transaction is scored by the Deep Neural Network for multi-variate statistical anomalies.
            </p>
          </div>

          <div className="space-y-2 border-t border-slate-800/80 pt-4 text-xs">
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Normal Transactions:</span>
              <span className="font-mono text-emerald-400 font-medium">{normalTxnCount}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Suspicious Flagged:</span>
              <span className="font-mono text-rose-400 font-medium">{suspiciousTxnCount}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span className="text-slate-400">Model Architecture:</span>
              <span className="font-mono text-slate-300">8-32-16-8-1 MLP</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/ai-security')}
            className="w-full py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-xs font-medium transition-colors text-center"
          >
            Open AI Security Center →
          </button>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
            <p className="text-xs text-slate-400">Latest contactless smartwatch and peer transfers</p>
          </div>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTxns.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8">
            No transactions yet. Use "Send Money" or "IoT Simulator" to initiate your first transfer.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Counterparty</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">DNN Result</th>
                  <th className="pb-3 text-right pr-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentTxns.map((t) => {
                  const isSender = t.sender_id === user?.id;
                  const isSuspicious = t.dnn_prediction === 'suspicious';
                  return (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/transactions?id=${t.transaction_id}`)}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pl-2 font-mono text-slate-300 font-medium">
                        {t.transaction_id}
                      </td>
                      <td className="py-3 text-slate-200">
                        {isSender ? t.receiver_name : t.sender_name}
                      </td>
                      <td className="py-3 text-slate-400 max-w-xs truncate">
                        {t.description}
                      </td>
                      <td
                        className={`py-3 text-right font-mono font-semibold tabular-nums ${
                          isSender ? 'text-slate-200' : 'text-emerald-400'
                        }`}
                      >
                        {isSender ? '-' : '+'}₹{t.amount.toLocaleString('en-IN', {
                          minimumFractionDigits: 2
                        })}
                      </td>
                      <td className="py-3 text-center">
                        {isSuspicious ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-rose-400 font-semibold">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>Suspicious ({(t.anomaly_probability * 100).toFixed(0)}%)</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            <span>Normal</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-2 text-right font-mono text-slate-500">
                        {new Date(t.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
