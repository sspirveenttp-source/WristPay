import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin';
import { Transaction } from '../../types';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Receipt,
  Search,
  ShieldCheck,
  AlertTriangle,
  Building,
  Watch,
  Filter,
  Sparkles
} from 'lucide-react';

export const AdminTransactionsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [terminalFilter, setTerminalFilter] = useState('all');

  const loadAllTransactions = async () => {
    setLoading(true);
    try {
      const list = await adminService.getTransactions();
      setTransactions(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTransactions();
  }, []);

  const filtered = transactions.filter((t) => {
    if (statusFilter !== 'all' && t.dnn_prediction !== statusFilter) return false;
    if (terminalFilter !== 'all' && t.terminal_id !== terminalFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.transaction_id.toLowerCase().includes(q) ||
        t.sender_name.toLowerCase().includes(q) ||
        t.receiver_name.toLowerCase().includes(q) ||
        t.device_id.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">All Platform Transactions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global ledger view across all smartwatches, merchant POS kiosks, and peer transfers.
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          Total: {transactions.length} records
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search TXN ID, watch ID, sender, receiver..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All DNN Statuses</option>
            <option value="normal">Normal Only</option>
            <option value="suspicious">Suspicious Only</option>
          </select>

          <select
            value={terminalFilter}
            onChange={(e) => setTerminalFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Terminals</option>
            <option value="TERM-001">TERM-001 (Cafeteria POS)</option>
            <option value="TERM-002">TERM-002 (Lab Kiosk)</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <LoadingSkeleton rows={5} height="h-16" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions found"
          description="Try broadening search filters."
        />
      ) : (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3 pl-2">Transaction ID</th>
                <th className="pb-3">Sender</th>
                <th className="pb-3">Receiver</th>
                <th className="pb-3">Device / Terminal</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-center">DNN Prediction</th>
                <th className="pb-3 text-right pr-2">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTxn(t)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                >
                  <td className="py-3 pl-2 font-mono text-indigo-400 font-semibold">{t.transaction_id}</td>
                  <td className="py-3 text-slate-200">{t.sender_name}</td>
                  <td className="py-3 text-slate-200">{t.receiver_name}</td>
                  <td className="py-3 font-mono text-slate-400 text-[11px]">
                    {t.device_id} → {t.terminal_id}
                  </td>
                  <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                    ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-center">
                    {t.dnn_prediction === 'suspicious' ? (
                      <span className="font-mono text-[11px] text-rose-400 font-semibold inline-flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-400" />
                        <span>Suspicious ({(t.anomaly_probability * 100).toFixed(0)}%)</span>
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-emerald-400 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
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
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details Modal */}
      {selectedTxn && (
        <Modal
          isOpen={!!selectedTxn}
          onClose={() => setSelectedTxn(null)}
          title={`Transaction Audit ${selectedTxn.transaction_id}`}
          subtitle="Deep Neural Network feature attribution and hardware route"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center space-y-1">
              <span className="text-3xl font-extrabold font-mono text-white">
                ₹{selectedTxn.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-slate-400">{selectedTxn.description}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Sender:</span>
                <span className="font-mono text-slate-200">{selectedTxn.sender_name} ({selectedTxn.sender_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Receiver:</span>
                <span className="font-mono text-slate-200">{selectedTxn.receiver_name} ({selectedTxn.receiver_id})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Device ID:</span>
                <span className="font-mono text-slate-200">{selectedTxn.device_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Terminal:</span>
                <span className="font-mono text-slate-200">{selectedTxn.terminal_id}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
              <span className="font-semibold text-white block">DNN Feature Attribution:</span>
              <p className="text-slate-300 leading-relaxed">{selectedTxn.explanation}</p>
            </div>

            <button
              onClick={() => setSelectedTxn(null)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
            >
              Close Audit
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};
