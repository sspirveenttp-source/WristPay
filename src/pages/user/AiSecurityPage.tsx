import React, { useState, useEffect } from 'react';
import { dnnService, DNNEvaluationResponse } from '../../services/dnn';
import { adminService } from '../../services/admin';
import { transactionService } from '../../services/transactions';
import { DNNMetrics, Transaction, AdminStats } from '../../types';
import { StatCard } from '../../components/common/StatCard';
import { RiskDonutChart } from '../../components/charts/RiskDonutChart';
import { FeatureImportanceBarChart } from '../../components/charts/FeatureImportanceBarChart';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorState } from '../../components/common/ErrorState';
import {
  ShieldAlert,
  Brain,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';

export const AiSecurityPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [metrics, setMetrics] = useState<DNNMetrics | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [flaggedTxns, setFlaggedTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Interactive Sandbox state
  const [sandboxAmount, setSandboxAmount] = useState<number>(250);
  const [sandboxHour, setSandboxHour] = useState<number>(14);
  const [sandboxVelocity, setSandboxVelocity] = useState<number>(1);
  const [sandboxInterval, setSandboxInterval] = useState<number>(3600);
  const [sandboxResult, setSandboxResult] = useState<DNNEvaluationResponse | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [m, s, txns] = await Promise.all([
        dnnService.getMetrics(),
        adminService.getStats(),
        transactionService.getTransactions({ status: 'suspicious' })
      ]);
      setMetrics(m);
      setStats(s);
      setFlaggedTxns(txns);
    } catch (err: any) {
      setError(err.message || 'Failed to load DNN metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const runSandboxEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await dnnService.evaluateFeatures({
        amount: sandboxAmount,
        hour_of_day: sandboxHour,
        velocity_1h: sandboxVelocity,
        interval_sec: sandboxInterval
      });
      setSandboxResult(res);
    } catch {
      // ignore
    } finally {
      setEvaluating(false);
    }
  };

  useEffect(() => {
    runSandboxEvaluation();
  }, [sandboxAmount, sandboxHour, sandboxVelocity, sandboxInterval]);

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

  if (error || !metrics || !stats) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs mb-2">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span>Prototype DNN-Based Anomaly Detection Model</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              AI Transaction Intelligence
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Real-time multi-variate anomaly inference evaluating transaction spikes, temporal deviation, burst velocities, and contactless NFC hardware telemetry.
            </p>
          </div>

          <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="text-[11px] font-mono text-slate-500 uppercase">Architecture</div>
            <div className="font-semibold text-slate-200">{metrics.architecture}</div>
            <div className="text-[11px] text-emerald-400 font-mono">ROC-AUC: {metrics.roc_auc}</div>
          </div>
        </div>
      </div>

      {/* Model Performance Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Accuracy"
          value={`${(metrics.accuracy * 100).toFixed(1)}%`}
          subtitle="Overall test accuracy across 15,000 synthetic IoT samples"
          icon={CheckCircle2}
          highlight
        />

        <StatCard
          title="Precision"
          value={`${(metrics.precision * 100).toFixed(1)}%`}
          subtitle="Low false positive rate avoids blocking valid transactions"
          icon={Brain}
        />

        <StatCard
          title="Recall"
          value={`${(metrics.recall * 100).toFixed(1)}%`}
          subtitle="Effective detection rate for rapid burst attacks"
          icon={ShieldAlert}
        />

        <StatCard
          title="F1-Score"
          value={metrics.f1_score.toFixed(4)}
          subtitle="Harmonic mean of precision and recall performance"
          icon={Layers}
        />
      </div>

      {/* Transaction Breakdown: Donut Chart + Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Distribution */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Network Risk Distribution</h3>
              <p className="text-xs text-slate-400">Total verified transactions vs. flagged anomalies</p>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Total: {stats.total_transactions}
            </span>
          </div>

          <div className="py-4">
            <RiskDonutChart
              normalCount={stats.normal_transactions}
              suspiciousCount={stats.suspicious_transactions}
              size={170}
            />
          </div>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Feature Weight Attributions</h3>
            <p className="text-xs text-slate-400">
              Relative neuron activation weights for the 8 normalized input features
            </p>
          </div>

          <FeatureImportanceBarChart features={metrics.feature_importance} />
        </div>
      </div>

      {/* Interactive DNN Sandbox (Examiner Live Testing) */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base font-semibold text-white">
                Interactive DNN Simulation Sandbox
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Test how the neural network responds live to changes in amount, time, burst velocity, and intervals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSandboxAmount(12000);
                setSandboxHour(2);
                setSandboxVelocity(6);
                setSandboxInterval(14);
              }}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 text-rose-300 border border-rose-800/40 text-xs font-medium hover:bg-rose-900 transition-colors"
            >
              Load Suspicious Attack Preset
            </button>
            <button
              onClick={() => {
                setSandboxAmount(220);
                setSandboxHour(14);
                setSandboxVelocity(1);
                setSandboxInterval(3600);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              Reset to Normal Preset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Input Column */}
          <div className="lg:col-span-7 space-y-4">
            {/* Amount Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Transaction Amount:</span>
                <span className="font-mono text-indigo-400 font-bold">
                  ₹{sandboxAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="25000"
                step="50"
                value={sandboxAmount}
                onChange={(e) => setSandboxAmount(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹50 (Coffee)</span>
                <span>₹5,000</span>
                <span>₹25,000 (Spike)</span>
              </div>
            </div>

            {/* Time of Day */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Hour of Day (24-hour cycle):</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {sandboxHour.toString().padStart(2, '0')}:00
                  {sandboxHour >= 23 || sandboxHour <= 4 ? ' (Overnight Flag)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="23"
                value={sandboxHour}
                onChange={(e) => setSandboxHour(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>00:00 (Midnight)</span>
                <span>12:00 (Noon)</span>
                <span>23:00 (Night)</span>
              </div>
            </div>

            {/* Velocity (1h) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Transactions in Past 60 Minutes (Velocity):</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {sandboxVelocity} payment{sandboxVelocity > 1 ? 's' : ''}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                value={sandboxVelocity}
                onChange={(e) => setSandboxVelocity(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Interval Delta */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Seconds Elapsed Since Prior Tap:</span>
                <span className="font-mono text-indigo-400 font-bold">
                  {sandboxInterval} seconds {sandboxInterval < 60 ? '(! Rapid burst)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="3600"
                step="5"
                value={sandboxInterval}
                onChange={(e) => setSandboxInterval(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Sandbox Live Inference Result */}
          <div className="lg:col-span-5 p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono uppercase tracking-wider">
                Live Model Prediction
              </span>
              {evaluating ? (
                <span className="text-indigo-400 animate-pulse text-[11px]">Computing...</span>
              ) : (
                <span className="text-emerald-400 text-[11px] font-mono">Real-time</span>
              )}
            </div>

            {sandboxResult && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Classification</span>
                    <span
                      className={`text-xl font-bold font-mono ${
                        sandboxResult.prediction === 'normal' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {sandboxResult.prediction.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block uppercase">Anomaly Probability</span>
                    <span className="text-xl font-bold font-mono text-white tabular-nums">
                      {sandboxResult.anomaly_percentage}%
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 leading-relaxed">
                  <span className="text-slate-400 block font-semibold text-[11px] mb-1">
                    AI Attribution Report:
                  </span>
                  {sandboxResult.explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Flagged Suspicious Transactions Table */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">Recently Flagged Network Transactions</h3>
            <p className="text-xs text-slate-400">Transactions with anomaly probability $\ge$ 50%</p>
          </div>
          <button
            onClick={() => navigate('/transactions?status=suspicious')}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            View all flagged →
          </button>
        </div>

        {flaggedTxns.length === 0 ? (
          <div className="text-center text-xs text-slate-500 py-8">
            No flagged transactions on record.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3 pl-2">Transaction ID</th>
                  <th className="pb-3">Sender</th>
                  <th className="pb-3">Receiver</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 text-center">Anomaly Risk</th>
                  <th className="pb-3 text-right pr-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {flaggedTxns.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => navigate(`/transactions?id=${t.transaction_id}`)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3 pl-2 font-mono text-rose-400 font-medium">{t.transaction_id}</td>
                    <td className="py-3 text-slate-300">{t.sender_name}</td>
                    <td className="py-3 text-slate-300">{t.receiver_name}</td>
                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 text-center font-mono text-rose-400 font-semibold">
                      {(t.anomaly_probability * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 pr-2 text-right font-mono text-slate-500">
                      {new Date(t.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
