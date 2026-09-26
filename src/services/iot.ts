import { apiRequest } from './api';
import { IoTDevice, PaymentTerminal } from '../types';

export interface IoTTransactionPayload {
  wristwatch_id: string;
  terminal_id: string;
  sender_id?: string;
  receiver_id?: string;
  amount: number;
  timestamp?: string;
}

export interface IoTTransactionResponse {
  status: 'success' | 'rejected';
  transaction_id?: string;
  dnn_prediction?: 'normal' | 'suspicious';
  anomaly_probability?: number;
  risk_level?: string;
  explanation?: string;
  sender_balance?: number;
  error_code?: string;
  message?: string;
  device?: {
    device_id: string;
    battery: number;
    wifi_status: string;
  };
  terminal?: {
    terminal_id: string;
    name: string;
  };
  timestamp?: string;
}

export const iotService = {
  async getDevices(): Promise<{ devices: IoTDevice[]; terminals: PaymentTerminal[] }> {
    return apiRequest<{ devices: IoTDevice[]; terminals: PaymentTerminal[] }>('/api/devices');
  },

  async getDeviceById(id: string): Promise<IoTDevice> {
    const res = await apiRequest<{ device: IoTDevice }>(`/api/devices/${id}`);
    return res.device;
  },

  async toggleDeviceStatus(id: string): Promise<IoTDevice> {
    const res = await apiRequest<{ status: string; device: IoTDevice }>(`/api/devices/${id}/toggle`, {
      method: 'POST'
    });
    return res.device;
  },

  /**
   * Future ESP32 REST Endpoint:
   * POST /api/iot/transaction
   * Called by ESP32 via Wi-Fi after NFC card emulation detection.
   * Also invoked directly by the IoT Simulator UI.
   */
  async processNfcTransaction(payload: IoTTransactionPayload): Promise<IoTTransactionResponse> {
    return apiRequest<IoTTransactionResponse>('/api/iot/transaction', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};
