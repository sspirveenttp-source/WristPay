import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminService } from '../../services/admin';
import { AdminStats, Alert, IoTDevice, Transaction } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RiskDonutChart } from '../../components/charts/RiskDonutChart';
import { SpendingLineChart } from '../../components/charts/SpendingLineChart';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Shield,
  Users,
  Watch,
  Receipt,
  AlertTriangle,
  Activity,
  Layers,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Radio,
  Lock
} from 'lucide-react';

export const AdminDashboardPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user, quickDemoLogin } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, a, d, t] = await Promise.all([
        adminService.getStats(),
        adminService.getAlerts(),
        adminService.getDevices(),
        adminService.getTransactions()
      ]);
      setStats(s);
      setRecentAlerts(a.slice(0, 4));
      setDevices(d);
      setTransactions(t.slice(0, 6));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  // Admin access guard
  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 max-w-lg mx-auto text-center rounded-2xl bg-slate-900 border border-slate-800 space-y-4 my-12">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          This portal is reserved for security officers and network administrators. In Demo Mode, you can switch roles with one click.
        </p>
        <button
          onClick={() => quickDemoLogin('ADMIN').then(loadAdminData)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
        >
          Elevate to Admin Role (admin@wristpay.ai)
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton height="h-28" rows={1} />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <LoadingSkeleton height="h-24" rows={4} />
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return <ErrorState message={error} onRetry={loadAdminData} />;
  }

  const volumeTrend = [
    { day: 'Mon', amount: 3200 },
    { day: 'Tue', amount: 4800 },
    { day: 'Wed', amount: 6100 },
    { day: 'Thu', amount: 8400 },
    { day: 'Fri', amount: 9200 },
    { day: 'Sat', amount: 7300 },
    { day: 'Sun', amount: 12500 }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-1">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>CENTRAL SECURITY OPERATIONS CONSOLE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time oversight of wearable IoT device health, transactions volume, and DNN anomaly flags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/alerts')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/40 text-xs font-semibold transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{stats.open_alerts} Open Alerts</span>
          </button>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.total_users}
          subtitle="Registered wallet holders"
          icon={Users}
        />

        <StatCard
          title="Active Wristwatches"
          value={`${stats.active_devices} / ${stats.total_devices}`}
          subtitle="Online & transmitting telemetry"
          icon={Watch}
          highlight
        />

        <StatCard
          title="Total Volume"
          value={`₹${stats.total_volume.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          })}`}
          subtitle="Cumulative platform throughput"
          icon={TrendingUp}
        />

        <StatCard
          title="Suspicious Flags"
          value={stats.suspicious_transactions}
          subtitle={`DNN Anomaly rate: ${stats.anomaly_rate}%`}
          icon={AlertTriangle}
        />
      </div>

      {/* Middle Row: Network Traffic Chart + Donut Risk Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Platform Transaction Volume (Weekly)</h3>
              <p className="text-xs text-slate-400">Aggregated throughput across all NFC terminals</p>
            </div>
            <button
              onClick={() => navigate('/admin/transactions')}
              className="text-xs text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
            >
              <span>View Logs</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <SpendingLineChart data={volumeTrend} height={190} />
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Anomaly Ratio</h3>
            <p className="text-xs text-slate-400">Normal operations vs flagged intrusions</p>
          </div>

          <RiskDonutChart
            normalCount={stats.normal_transactions}
            suspiciousCount={stats.suspicious_transactions}
            size={160}
          />

          <button
            onClick={() => navigate('/ai-security')}
            className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium text-center transition-colors border border-slate-700"
          >
            Review DNN Weights →
          </button>
        </div>
      </div>

      {/* IoT Devices Fleet Quick Status */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Registered IoT Device Fleet</h3>
            <p className="text-xs text-slate-400">Current firmware status, battery level, and wireless link</p>
          </div>
          <button
            onClick={() => navigate('/admin/devices')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Manage all devices →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {devices.map((d) => (
            <div
              key={d.id}
              onClick={() => navigate('/admin/devices')}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-colors space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-white">{d.device_id}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    d.status === 'Online'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : d.status === 'Warning'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {d.status}
                </span>
              </div>
              <div className="text-xs text-slate-300">{d.device_name}</div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono border-t border-slate-800/80 pt-2">
                <span>Battery: {d.battery}%</span>
                <span>FW: {d.firmware_version}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Alerts List */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Priority System Alerts</h3>
            <p className="text-xs text-slate-400">Suspicious activities and low battery hardware alarms</p>
          </div>
          <button
            onClick={() => navigate('/admin/alerts')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            All alerts →
          </button>
        </div>

        <div className="space-y-3">
          {recentAlerts.map((alt) => (
            <div
              key={alt.id}
              className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    alt.severity === 'CRITICAL' ? 'bg-rose-500 animate-ping' : 'bg-amber-400'
                  }`}
                />
                <div>
                  <span className="font-semibold text-slate-200 block">{alt.alert_type}</span>
                  <span className="text-slate-400 text-[11px]">{alt.message}</span>
                </div>
              </div>
              <span className="font-mono text-[11px] text-slate-500 shrink-0">
                {new Date(alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
