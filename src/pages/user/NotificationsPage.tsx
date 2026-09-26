import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { notificationService } from '../../services/notifications';
import { AppNotification } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Watch,
  Check,
  Trash2
} from 'lucide-react';

export const NotificationsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const list = await notificationService.getNotifications(user?.id);
      setNotifications(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkRead = async (id: string) => {
    await notificationService.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead(user?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('info', 'All Caught Up', 'All notifications marked as read.');
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.read;
    if (filterType === 'ALERTS') return n.type === 'SUSPICIOUS_ALERT';
    if (filterType === 'PAYMENTS') return n.type === 'PAYMENT_SUCCESS' || n.type === 'PAYMENT_RECEIVED';
    return true;
  });

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'PAYMENT_SUCCESS':
        return <ArrowUpRight className="w-4 h-4 text-slate-300" />;
      case 'PAYMENT_RECEIVED':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'SUSPICIOUS_ALERT':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'WALLET_RECHARGE':
        return <PlusCircle className="w-4 h-4 text-indigo-400" />;
      case 'DEVICE_CONNECTED':
      case 'DEVICE_DISCONNECTED':
        return <Watch className="w-4 h-4 text-cyan-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time alerts for payments, wallet credits, and neural network anomaly warnings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/60 border border-slate-800/80 rounded-xl w-fit text-xs">
        {['ALL', 'UNREAD', 'ALERTS', 'PAYMENTS'].map((f) => (
          <button
            key={f}
            onClick={() => setFilterType(f)}
            className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
              filterType === f
                ? 'bg-indigo-600 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {f === 'ALL' ? 'All Notifications' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <LoadingSkeleton rows={4} height="h-20" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications in this filter"
          description="You're completely up to date with transactions and watch telemetry."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                !n.read
                  ? 'bg-slate-900/90 border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 shrink-0">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                    <span>{n.title}</span>
                    {!n.read && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    )}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-mono shrink-0">
                    {new Date(n.created_at).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
