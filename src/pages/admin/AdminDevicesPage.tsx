import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { adminService } from '../../services/admin';
import { iotService } from '../../services/iot';
import { IoTDevice } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Watch,
  Battery,
  Wifi,
  Radio,
  RotateCw,
  Power,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Shield
} from 'lucide-react';

export const AdminDevicesPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const list = await adminService.getDevices();
      setDevices(list);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [user]);

  const handleToggleStatus = async (deviceId: string) => {
    try {
      const updated = await iotService.toggleDeviceStatus(deviceId);
      setDevices((prev) =>
        prev.map((d) => (d.device_id === deviceId ? updated : d))
      );
      showToast('info', `Status Changed: ${deviceId}`, `Now set to ${updated.status}.`);
    } catch (err: any) {
      showToast('error', 'Toggle Failed', err.message);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={4} height="h-24" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">IoT Device Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Fleet health, wireless link states, battery telemetry, and NFC firmware versions.
          </p>
        </div>

        <button
          onClick={loadDevices}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Refresh Fleet</span>
        </button>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {devices.map((device) => {
          let badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          if (device.status === 'Warning') badgeColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
          else if (device.status === 'Offline' || device.status === 'Disconnected') {
            badgeColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
          }

          return (
            <div
              key={device.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Watch className="w-5 h-5 text-indigo-400" />
                    <span className="font-mono text-sm font-bold text-white">
                      {device.device_id}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${badgeColor}`}>
                    {device.status}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-200">{device.device_name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">Assigned to: {device.user_name}</p>

                {/* Telemetry info */}
                <div className="space-y-2 pt-4 mt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Battery className="w-3.5 h-3.5" /> Battery Level:
                    </span>
                    <span className="font-mono font-bold text-white">{device.battery}%</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Wifi className="w-3.5 h-3.5" /> Wi-Fi Status:
                    </span>
                    <span className="font-mono text-slate-300">{device.wifi_status}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5" /> NFC Protocol:
                    </span>
                    <span className="font-mono text-emerald-400">{device.nfc_status}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">Firmware:</span>
                    <span className="font-mono text-slate-400">{device.firmware_version}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-500">MAC Address:</span>
                    <span className="font-mono text-slate-400 text-[11px]">{device.mac_address}</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(device.device_id)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cycle State</span>
                </button>
                <button
                  onClick={() => navigate('/iot-simulator')}
                  className="py-2 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/40 text-xs font-semibold transition-colors"
                >
                  Simulate
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
