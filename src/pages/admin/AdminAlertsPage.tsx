import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/admin';
import { useToast } from '../../context/ToastContext';
import { Alert } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Watch,
  ShieldAlert,
  BatteryCharging,
  RotateCcw
} from 'lucide-react';

export const AdminAlertsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const list = await adminService.getAlerts();
      setAlerts(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleResolve = async (id: string) => {
    try {
      const updated = await adminService.resolveAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? updated : a)));
      showToast('success', 'Alert Resolved', `Incident ${id} marked as resolved.`);
    } catch (err: any) {
      showToast('error', 'Action Failed', err.message);
    }
  };

  const filtered = alerts.filter((a) => {
    if (filterStatus === 'OPEN') return a.status === 'OPEN';
    if (filterStatus === 'RESOLVED') return a.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Security & Hardware Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time incident stream triggered by the DNN anomaly engine and watch telemetry monitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'OPEN', 'RESOLVED'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-rose-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-20" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No alerts in this view"
          description="All systems normal across wearable watches and NFC POS kiosks."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((alert) => {
            const isOpen = alert.status === 'OPEN';
            return (
              <div
                key={alert.id}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isOpen
                    ? 'bg-slate-900/90 border-rose-900/40 shadow-lg'
                    : 'bg-slate-900/40 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl border shrink-0 ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-rose-950/60 border-rose-800/60 text-rose-400'
                        : 'bg-amber-950/60 border-amber-800/60 text-amber-400'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">
                        {alert.alert_id}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          alert.severity === 'CRITICAL'
                            ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(alert.created_at).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100">{alert.alert_type}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
                      {alert.message}
                    </p>

                    <div className="text-[11px] font-mono text-slate-500 pt-1 flex items-center gap-3">
                      {alert.transaction_id && (
                        <span>Txn: <span className="text-indigo-400">{alert.transaction_id}</span></span>
                      )}
                      {alert.device_id && (
                        <span>Device: <span className="text-slate-300">{alert.device_id}</span></span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="sm:self-center shrink-0">
                  {isOpen ? (
                    <button
                      onClick={() => handleResolve(alert.id)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Mark Resolved</span>
                    </button>
                  ) : (
                    <span className="text-xs font-mono text-emerald-400 font-semibold px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40">
                      RESOLVED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
