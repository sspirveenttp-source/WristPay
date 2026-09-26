import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/transactions';
import { Transaction } from '../../types';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Search,
  Filter,
  Receipt,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Watch,
  Building,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const TransactionsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const list = await transactionService.getTransactions({
        user_id: user?.id,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      });
      setTransactions(list);
    } catch {
      // error handled cleanly
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [user, statusFilter, typeFilter, searchTerm]);

  // Check URL query for direct modal open
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId = params.get('id');
    if (txnId && transactions.length > 0) {
      const match = transactions.find((t) => t.transaction_id === txnId);
      if (match) setSelectedTxn(match);
    }
  }, [transactions]);

  // Client sort
  const sortedTxns = [...transactions].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    if (sortBy === 'date_asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    if (sortBy === 'amount_desc') return b.amount - a.amount;
    if (sortBy === 'amount_asc') return a.amount - b.amount;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, search, and analyze all smart watch and peer transfers scored by the DNN engine.
          </p>
        </div>

        <button
          onClick={() => navigate('/send-money')}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors self-start sm:self-auto"
        >
          Send Money
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TXN ID, counterparty, description..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status segmented control */}
          <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'all' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('normal')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'normal' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => setStatusFilter('suspicious')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                statusFilter === 'suspicious' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Suspicious
            </button>
          </div>

          {/* Type filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="sent">Sent Only</option>
            <option value="received">Received Only</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSkeleton rows={6} height="h-14" />
      ) : sortedTxns.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions match your criteria"
          description="Try modifying search keywords or clearing status filters."
          actionText="Clear Filters"
          onAction={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setTypeFilter('all');
          }}
        />
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">Transaction ID</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Sender / Receiver</th>
                <th className="pb-3">Description</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">DNN Security</th>
                <th className="pb-3 text-right pr-2">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sortedTxns.map((t) => {
                const isSender = t.sender_id === user?.id;
                const isSuspicious = t.dnn_prediction === 'suspicious';
                return (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTxn(t)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pl-2 font-mono text-indigo-400 font-medium group-hover:underline">
                      {t.transaction_id}
                    </td>
                    <td className="py-3">
                      {isSender ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                          <span>Sent</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Received</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-200">
                      <span className="font-medium">
                        {isSender ? t.receiver_name : t.sender_name}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">{t.description}</td>
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Flagged ({(t.anomaly_probability * 100).toFixed(0)}%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Normal</span>
                        </span>
                      )}
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
      )}

      {/* Transaction Details Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction ${selectedTxn.transaction_id}`}
          subtitle="Detailed Deep Neural Network transaction verification breakdown"
          maxWidth="max-w-xl"
        >
          <div className="space-y-6">
            {/* Amount Banner */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
                Total Transaction Volume
              </span>
              <span className="text-3xl font-extrabold font-mono text-white tabular-nums">
                ₹{selectedTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-xs text-slate-400">{selectedTxn.description}</p>
            </div>

            {/* Entity metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Sender:</span>
                <span className="font-semibold text-slate-200 block">{selectedTxn.sender_name}</span>
                <span className="font-mono text-[10px] text-slate-400">ID: {selectedTxn.sender_id}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-500 block">Receiver:</span>
                <span className="font-semibold text-slate-200 block">{selectedTxn.receiver_name}</span>
                <span className="font-mono text-[10px] text-slate-400">ID: {selectedTxn.receiver_id}</span>
              </div>
            </div>

            {/* Hardware & Terminal Info */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Watch className="w-3.5 h-3.5 text-indigo-400" />
                  Originating Wristwatch:
                </span>
                <span className="font-mono text-slate-200">{selectedTxn.device_id || 'WP-001'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-400" />
                  NFC POS Terminal:
                </span>
                <span className="font-mono text-slate-200">{selectedTxn.terminal_id || 'TERM-001'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Settlement Timestamp:
                </span>
                <span className="font-mono text-slate-300">
                  {new Date(selectedTxn.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            {/* DNN Intelligence Attribution */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="font-semibold text-white text-xs">
                    DNN Anomaly Attribution
                  </span>
                </div>
                <span
                  className={`font-mono font-bold text-xs ${
                    selectedTxn.dnn_prediction === 'normal' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedTxn.dnn_prediction.toUpperCase()} ({(selectedTxn.anomaly_probability * 100).toFixed(1)}%)
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedTxn.explanation}
              </p>

              {selectedTxn.reasons && selectedTxn.reasons.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-indigo-900/40">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Feature Deviations Identified:
                  </span>
                  <ul className="space-y-1">
                    {selectedTxn.reasons.map((r, i) => (
                      <li key={i} className="text-[11px] text-rose-300 flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
