import { apiRequest, setAuthToken, removeAuthToken } from './api';
import { User } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setAuthToken(res.token);
    return res;
  },

  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirm_password: string;
    wristwatch_id?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await apiRequest<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    setAuthToken(res.token);
    return res;
  },

  async getCurrentUser(): Promise<User> {
    const res = await apiRequest<{ user: User }>('/api/auth/me');
    return res.user;
  },

  async forgotPassword(email: string): Promise<{ message: string; demo_password?: string }> {
    return apiRequest<{ message: string; demo_password?: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  logout(): void {
    removeAuthToken();
  }
};
