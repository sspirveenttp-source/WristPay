import { apiRequest } from './api';
import { AdminStats, User, IoTDevice, Transaction, Alert } from '../types';

export const adminService = {
  async getStats(): Promise<AdminStats> {
    return apiRequest<AdminStats>('/api/admin/stats');
  },

  async getUsers(): Promise<User[]> {
    const res = await apiRequest<{ users: User[] }>('/api/admin/users');
    return res.users;
  },

  async getDevices(): Promise<IoTDevice[]> {
    const res = await apiRequest<{ devices: IoTDevice[] }>('/api/admin/devices');
    return res.devices;
  },

  async getTransactions(): Promise<Transaction[]> {
    const res = await apiRequest<{ transactions: Transaction[] }>('/api/admin/transactions');
    return res.transactions;
  },

  async getAlerts(): Promise<Alert[]> {
    const res = await apiRequest<{ alerts: Alert[] }>('/api/admin/alerts');
    return res.alerts;
  },

  async resolveAlert(id: string): Promise<Alert> {
    const res = await apiRequest<{ alert: Alert }>('/api/admin/alerts/' + id + '/resolve', {
      method: 'POST'
    });
    return res.alert;
  }
};
