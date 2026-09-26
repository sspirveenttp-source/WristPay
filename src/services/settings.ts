import { apiRequest } from './api';

export interface UserSettings {
  name: string;
  email: string;
  phone: string;
  wristwatch_id: string;
  notifications: {
    payment_success: boolean;
    security_alerts: boolean;
    device_telemetry: boolean;
    daily_digest: boolean;
  };
  security: {
    two_factor: boolean;
    biometric_nfc: boolean;
    nfc_spending_limit: number;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
  };
}

export const settingsService = {
  async getSettings(userId?: string): Promise<UserSettings> {
    const url = userId ? `/api/settings?user_id=${userId}` : '/api/settings';
    const res = await apiRequest<{ settings: UserSettings }>(url);
    return res.settings;
  },

  async updateSettings(settings: Partial<UserSettings>, userId?: string): Promise<UserSettings> {
    const res = await apiRequest<{ settings: UserSettings }>('/api/settings', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, settings })
    });
    return res.settings;
  }
};
