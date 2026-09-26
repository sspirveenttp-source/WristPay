import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { settingsService, UserSettings } from '../../services/settings';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  User,
  Shield,
  Wallet,
  Watch,
  Bell,
  Palette,
  Info,
  Check,
  Save,
  Lock,
  Smartphone
} from 'lucide-react';

export const SettingsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'device' | 'notifications' | 'about'>('profile');

  // Change password local state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    settingsService.getSettings(user?.id).then((s) => {
      setSettings(s);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(settings, user?.id);
      showToast('success', 'Settings Saved', 'Your configuration was successfully updated.');
    } catch (err: any) {
      showToast('error', 'Save Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <LoadingSkeleton rows={4} height="h-28" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure profile, paired hardware credentials, and notification thresholds.
          </p>
        </div>

        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-colors disabled:opacity-50 self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Tab Sidebar */}
        <div className="md:col-span-4 space-y-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
              activeTab === 'profile'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Identity</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
              activeTab === 'security'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Passwords</span>
          </button>

          <button
            onClick={() => setActiveTab('device')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
              activeTab === 'device'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Watch className="w-4 h-4" />
            <span>Wristwatch Hardware</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
              activeTab === 'notifications'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Alert Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
              activeTab === 'about'
                ? 'bg-indigo-600/15 text-indigo-400 font-semibold border-l-2 border-indigo-500'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About Prototype</span>
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="md:col-span-8 p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-6">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Profile Information</h3>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-white">Security & Access Control</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Biometric Watch Unlock
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Require optical PPG sensor heartbeat detection before NFC token transmission
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.biometric_nfc}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, biometric_nfc: e.target.checked }
                      })
                    }
                    className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">
                      Two-Factor Authentication
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Step-up verification for transfers exceeding ₹5,000
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.security.two_factor}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        security: { ...settings.security, two_factor: e.target.checked }
                      })
                    }
                    className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-200">Change Password</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="password"
                    placeholder="Current demo password"
                    value={currPassword}
                    onChange={(e) => setCurrPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="password"
                    placeholder="New password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'device' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Paired Wristwatch Telemetry</h3>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Wristwatch Hardware ID</label>
                <input
                  type="text"
                  value={settings.wristwatch_id}
                  onChange={(e) => setSettings({ ...settings, wristwatch_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">NFC Hardware</span>
                  <span className="font-mono text-emerald-400 font-semibold">Active & Ready</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[11px]">Firmware Stream</span>
                  <span className="font-mono text-slate-300">v1.0.0-PROTOTYPE</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Notification Dispatch Rules</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Payment Success Alerts</span>
                    <span className="text-[11px] text-slate-500">Instant toast & record on every NFC tap</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.payment_success}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, payment_success: e.target.checked }
                      })
                    }
                    className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">DNN Anomaly Warnings</span>
                    <span className="text-[11px] text-slate-500">High priority alert when anomaly score &gt; 50%</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.security_alerts}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, security_alerts: e.target.checked }
                      })
                    }
                    className="accent-indigo-600 w-4 h-4 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-4 text-xs">
              <h3 className="text-sm font-semibold text-white">About WristPay AI</h3>
              <p className="text-slate-300 leading-relaxed">
                “IoT Cashless Money Transfer Wristwatch with DNN-Based Transaction Anomaly Detection”
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] space-y-1 text-slate-400">
                <div>Build: 2026.09-Release</div>
                <div>Runtime: Node.js + Express Full-Stack + React Vite</div>
                <div>DNN: 8-32-16-8-1 MLP with ReLU, BatchNorm & Sigmoid</div>
                <div>IoT Gateway: POST /api/iot/transaction</div>
                <div>Platform Status: DEMO MODE — NO REAL CURRENCY</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
