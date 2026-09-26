import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { iotService, IoTTransactionResponse } from '../../services/iot';
import { adminService } from '../../services/admin';
import { IoTDevice, PaymentTerminal, User } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Watch,
  Wifi,
  Battery,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Radio,
  Sliders,
  Power
} from 'lucide-react';
import confetti from 'canvas-confetti';

type SimulationStep =
  | 'IDLE'
  | 'NFC_DETECTED'
  | 'DEVICE_AUTHENTICATED'
  | 'PAYMENT_PROCESSING'
  | 'DNN_ANALYSIS'
  | 'TRANSACTION_SETTLED';

export const IotSimulatorPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [terminals, setTerminals] = useState<PaymentTerminal[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form controls
  const [selectedDevice, setSelectedDevice] = useState('WP-001');
  const [selectedTerminal, setSelectedTerminal] = useState('TERM-001');
  const [selectedReceiver, setSelectedReceiver] = useState('USER-004'); // Canteen
  const [amount, setAmount] = useState('180');

  // Interactive hardware states
  const [watchBattery, setWatchBattery] = useState<number>(87);
  const [watchWifi, setWatchWifi] = useState<'Connected' | 'Weak' | 'Disconnected'>('Connected');
  const [watchStatus, setWatchStatus] = useState<'Online' | 'Warning' | 'Offline'>('Online');

  // Animation flow state
  const [simStep, setSimStep] = useState<SimulationStep>('IDLE');
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<IoTTransactionResponse | null>(null);

  const loadHardwareFleet = async () => {
    setLoading(true);
    try {
      const [iotData, uList] = await Promise.all([
        iotService.getDevices(),
        adminService.getUsers()
      ]);
      setDevices(iotData.devices);
      setTerminals(iotData.terminals);
      setUsersList(uList);

      const currentDev = iotData.devices.find((d) => d.device_id === (user?.wristwatch_id || 'WP-001'));
      if (currentDev) {
        setSelectedDevice(currentDev.device_id);
        setWatchBattery(currentDev.battery);
        setWatchWifi(currentDev.wifi_status);
        setWatchStatus(currentDev.status as any);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHardwareFleet();
  }, [user]);

  const activeDeviceData = devices.find((d) => d.device_id === selectedDevice);
  const activeTerminalData = terminals.find((t) => t.terminal_id === selectedTerminal);

  const handleSimulatePayment = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('error', 'Invalid Amount', 'Please provide a valid transaction amount.');
      return;
    }

    if (watchStatus === 'Offline') {
      showToast('error', 'Watch Offline', 'Wristwatch is powered off. Switch to Online to simulate.');
      return;
    }

    if (watchBattery <= 5) {
      showToast('error', 'Battery Depleted', 'Wristwatch battery level is too low for NFC card emulation.');
      return;
    }

    setSimulating(true);
    setResult(null);

    // Step 1: NFC Tap Detected
    setSimStep('NFC_DETECTED');
    await new Promise((r) => setTimeout(r, 600));

    // Step 2: Device Authenticated
    setSimStep('DEVICE_AUTHENTICATED');
    await new Promise((r) => setTimeout(r, 550));

    // Step 3: Payment Processing
    setSimStep('PAYMENT_PROCESSING');
    await new Promise((r) => setTimeout(r, 500));

    // Step 4: DNN Analysis
    setSimStep('DNN_ANALYSIS');

    try {
      const response = await iotService.processNfcTransaction({
        wristwatch_id: selectedDevice,
        terminal_id: selectedTerminal,
        sender_id: user?.id,
        receiver_id: selectedReceiver,
        amount: numAmount,
        timestamp: new Date().toISOString()
      });

      await new Promise((r) => setTimeout(r, 650));
      setSimStep('TRANSACTION_SETTLED');
      setResult(response);
      setWatchBattery((prev) => Math.max(1, prev - 1));

      await refreshUser();

      if (response.dnn_prediction === 'normal') {
        showToast(
          'success',
          'NFC Payment Approved!',
          `Transferred ₹${numAmount} at ${activeTerminalData?.name || selectedTerminal}`
        );
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        showToast(
          'warning',
          'DNN Anomaly Flagged!',
          `Transaction processed with ${(Number(response.anomaly_probability) * 100).toFixed(1)}% anomaly probability.`
        );
      }
    } catch (err: any) {
      setSimStep('IDLE');
      showToast('error', 'IoT Processing Rejected', err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={5} height="h-20" />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ESP32 Hardware Simulation Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              IoT Wristwatch Simulator
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              Emulates the exact ISO/IEC 14443 NFC tap exchange and REST API payload dispatched by the future ESP32 smart wristband.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">API Spec:</span>
            <span className="text-xs font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-indigo-400">
              POST /api/iot/transaction
            </span>
          </div>
        </div>
      </div>

      {/* Main Hardware Workspace: Smartwatch (Left) + NFC Wave (Center) + Terminal (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* SMART WRISTWATCH UNIT */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Watch className="w-5 h-5 text-indigo-400" />
              <span className="font-semibold text-white text-sm">SMART WRISTWATCH</span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  watchStatus === 'Online'
                    ? 'bg-emerald-400'
                    : watchStatus === 'Warning'
                    ? 'bg-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-xs font-mono text-slate-300">{watchStatus}</span>
            </div>
          </div>

          {/* Realistic Virtual Smartwatch Mockup with OLED Display */}
          <div className="mx-auto w-64 bg-slate-950 p-4 rounded-3xl border-4 border-slate-800 shadow-2xl relative">
            {/* Watch strap anchors */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-3 bg-slate-800 rounded-t-md" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-3 bg-slate-800 rounded-b-md" />

            {/* OLED Bezel & Monochrome Screen (128x64 Simulation) */}
            <div className="bg-black p-3 rounded-2xl border border-slate-900 shadow-inner font-mono text-cyan-400 text-xs min-h-[120px] flex flex-col justify-between select-none">
              {/* OLED Top Bar */}
              <div className="flex items-center justify-between text-[10px] text-cyan-500 border-b border-cyan-950 pb-1">
                <span>{selectedDevice}</span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5">
                    <Wifi className="w-3 h-3" />
                    <span>{watchWifi === 'Connected' ? 'WiFi' : 'NoNet'}</span>
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Battery className="w-3 h-3" />
                    <span>{watchBattery}%</span>
                  </span>
                </div>
              </div>

              {/* OLED Center Screen */}
              <div className="py-2 text-center">
                {simStep === 'IDLE' && (
                  <div>
                    <div className="text-[10px] text-cyan-600 uppercase tracking-widest">NFC Ready</div>
                    <div className="text-base font-bold text-cyan-300 tracking-wider">
                      ₹{user?.wallet_balance.toFixed(2)}
                    </div>
                    <div className="text-[9px] text-cyan-500">Hold near terminal</div>
                  </div>
                )}

                {simStep === 'NFC_DETECTED' && (
                  <div className="animate-pulse">
                    <div className="text-xs text-amber-300 font-bold">NFC TAP DETECTED</div>
                    <div className="text-[10px] text-cyan-400">Emulating NTAG215...</div>
                  </div>
                )}

                {simStep === 'DEVICE_AUTHENTICATED' && (
                  <div className="animate-pulse">
                    <div className="text-xs text-indigo-300 font-bold">DEVICE VERIFIED</div>
                    <div className="text-[10px] text-cyan-400">SSL Handshake Ok</div>
                  </div>
                )}

                {simStep === 'PAYMENT_PROCESSING' && (
                  <div className="animate-pulse">
                    <div className="text-xs text-indigo-300 font-bold">DISPATCHING ₹{amount}</div>
                    <div className="text-[10px] text-cyan-400">Posting to Gateway...</div>
                  </div>
                )}

                {simStep === 'DNN_ANALYSIS' && (
                  <div className="animate-pulse">
                    <div className="text-xs text-violet-300 font-bold">AI INFERENCE</div>
                    <div className="text-[10px] text-cyan-400">Evaluating Anomaly...</div>
                  </div>
                )}

                {simStep === 'TRANSACTION_SETTLED' && result && (
                  <div>
                    <div
                      className={`text-xs font-bold ${
                        result.dnn_prediction === 'normal' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {result.dnn_prediction === 'normal' ? '✓ APPROVED' : '⚠ FLAGGED'}
                    </div>
                    <div className="text-sm font-bold text-cyan-200">₹{amount}</div>
                    <div className="text-[9px] text-cyan-500">
                      Bal: ₹{result.sender_balance?.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* OLED Bottom Protocol */}
              <div className="text-[9px] text-cyan-600 flex justify-between border-t border-cyan-950 pt-1">
                <span>PN532 SPI</span>
                <span>FW: v1.0.0</span>
              </div>
            </div>

            {/* Tactile Watch Crown Button */}
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-2.5 h-6 bg-slate-700 rounded-r border border-slate-600 shadow" />
          </div>

          {/* Smartwatch Telemetry Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Wristwatch ID</span>
              <span className="font-mono text-slate-200 font-semibold">{selectedDevice}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Battery Status</span>
              <span className="font-mono text-slate-200 font-semibold">{watchBattery}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Wi-Fi Network</span>
              <span className="font-mono text-slate-200 font-semibold">{watchWifi}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">NFC Hardware</span>
              <span className="font-mono text-emerald-400 font-semibold">Ready (PN532)</span>
            </div>
          </div>

          {/* Hardware Edge Case Testing Controls */}
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Examiner Hardware Edge-Case Controls
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setWatchStatus(watchStatus === 'Online' ? 'Offline' : 'Online')}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono transition-colors"
              >
                Toggle Power: {watchStatus}
              </button>
              <button
                type="button"
                onClick={() => setWatchBattery(watchBattery <= 10 ? 87 : 5)}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono transition-colors"
              >
                Simulate Low Battery (5%)
              </button>
              <button
                type="button"
                onClick={() => setWatchBattery(100)}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 font-mono transition-colors"
              >
                Charge (100%)
              </button>
            </div>
          </div>
        </div>

        {/* PAYMENT TERMINAL UNIT */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-white text-sm">PAYMENT TERMINAL</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-xs font-mono text-slate-300">{activeTerminalData?.status || 'Online'}</span>
            </div>
          </div>

          {/* POS Terminal Visual */}
          <div className="mx-auto w-64 bg-slate-950 p-5 rounded-3xl border-4 border-slate-800 shadow-2xl relative text-center space-y-4">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              {activeTerminalData?.name || 'Campus Dining POS'}
            </div>

            {/* Tap Target Zone */}
            <div className="relative py-6 px-4 rounded-2xl bg-slate-900/80 border-2 border-dashed border-emerald-500/40 flex flex-col items-center justify-center space-y-2 overflow-hidden">
              {simulating && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full border border-emerald-500/40 animate-radar" />
                  <div className="w-40 h-40 rounded-full border border-emerald-500/20 animate-radar" />
                </div>
              )}

              <Radio className={`w-8 h-8 ${simulating ? 'text-emerald-400 animate-bounce' : 'text-slate-500'}`} />
              <div className="text-xs font-semibold text-slate-200">
                {simulating ? 'NFC SIGNAL LINKED' : 'TAP WRISTWATCH HERE'}
              </div>
              <span className="text-[10px] text-slate-500 font-mono">13.56 MHz High Frequency</span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Terminal: <span className="text-white">{selectedTerminal}</span>
            </div>
          </div>

          {/* Terminal Telemetry Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Terminal ID</span>
              <span className="font-mono text-slate-200 font-semibold">{selectedTerminal}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Connection Protocol</span>
              <span className="font-mono text-emerald-400 font-semibold">TLS 1.3 / WPA3</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Last Transaction</span>
              <span className="font-mono text-slate-300 font-semibold">
                {activeTerminalData?.last_transaction_id || 'TXN-928374'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[11px]">Location</span>
              <span className="text-slate-300 font-medium truncate block">
                {activeTerminalData?.location || 'Campus Canteen'}
              </span>
            </div>
          </div>

          {/* Terminal Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Terminal:</span>
            {terminals.map((term) => (
              <button
                key={term.terminal_id}
                type="button"
                onClick={() => setSelectedTerminal(term.terminal_id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  selectedTerminal === term.terminal_id
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {term.terminal_id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction Control Station */}
      <div className="p-6 sm:p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-6">
        <div>
          <h3 className="text-base font-semibold text-white">Execute NFC Contactless Payment</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure transaction parameters to test normal POS transactions or anomalous high-value spikes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Receiving Merchant / Entity
            </label>
            <select
              value={selectedReceiver}
              onChange={(e) => setSelectedReceiver(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {usersList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Payment Amount (₹)
            </label>
            <div className="relative">
              <span className="text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs">
                ₹
              </span>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="180"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSimulatePayment}
              disabled={simulating}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>{simulating ? 'Simulating NFC...' : 'Simulate NFC Tap & Pay'}</span>
            </button>
          </div>
        </div>

        {/* Quick Amount presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-slate-500">Presets:</span>
          <button
            onClick={() => setAmount('140')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
          >
            ₹140 (Canteen Coffee - Normal)
          </button>
          <button
            onClick={() => setAmount('450')}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
          >
            ₹450 (Bookstore - Normal)
          </button>
          <button
            onClick={() => setAmount('12000')}
            className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 border border-rose-800/40 text-rose-300 font-mono font-semibold"
          >
            ₹12,000 (Spike Anomaly Test)
          </button>
        </div>

        {/* Live Animated Pipeline Status */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Transaction Execution Pipeline</span>
            <span className="font-mono text-[11px] text-slate-500 uppercase">
              Current Stage: {simStep.replace('_', ' ')}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-mono">
            <div
              className={`p-2 rounded-lg border transition-all ${
                simStep === 'NFC_DETECTED'
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-200 font-bold scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              1. NFC DETECTED
            </div>
            <div
              className={`p-2 rounded-lg border transition-all ${
                simStep === 'DEVICE_AUTHENTICATED'
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-200 font-bold scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              2. AUTHENTICATED
            </div>
            <div
              className={`p-2 rounded-lg border transition-all ${
                simStep === 'PAYMENT_PROCESSING'
                  ? 'bg-indigo-950 border-indigo-500 text-indigo-200 font-bold scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              3. PROCESSING
            </div>
            <div
              className={`p-2 rounded-lg border transition-all ${
                simStep === 'DNN_ANALYSIS'
                  ? 'bg-violet-950 border-violet-500 text-violet-200 font-bold scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              4. DNN ANALYSIS
            </div>
            <div
              className={`p-2 rounded-lg border transition-all ${
                simStep === 'TRANSACTION_SETTLED'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              5. APPROVED
            </div>
            <div
              className={`p-2 rounded-lg border transition-all ${
                simStep === 'TRANSACTION_SETTLED'
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold scale-105'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              6. WALLET UPDATED
            </div>
          </div>
        </div>

        {/* Settled Result Card */}
        {result && (
          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-[11px] text-slate-500 block">Server API Response</span>
                <span className="font-mono text-sm font-bold text-white">
                  {result.transaction_id}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">DNN Assessment</span>
                <span
                  className={`font-mono text-xs font-bold ${
                    result.dnn_prediction === 'normal' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {result.dnn_prediction?.toUpperCase()} (
                  {(Number(result.anomaly_probability) * 100).toFixed(1)}% risk)
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {result.explanation}
            </p>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/60 font-mono">
              <span>Updated Sender Balance: ₹{result.sender_balance?.toFixed(2)}</span>
              <button
                onClick={() => navigate(`/transactions?id=${result.transaction_id}`)}
                className="text-indigo-400 hover:underline"
              >
                Inspect in Transactions →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
