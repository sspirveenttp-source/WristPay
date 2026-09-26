import { apiRequest } from './api';
import { Transaction } from '../types';

export interface WalletBalanceResponse {
  wallet_balance: number;
  total_spent: number;
  total_received: number;
  daily_spending: Array<{ day: string; amount: number }>;
  currency: string;
  symbol: string;
  wristwatch_id: string;
}

export const walletService = {
  async getBalance(userId?: string): Promise<WalletBalanceResponse> {
    const url = userId ? `/api/wallet/balance?user_id=${userId}` : '/api/wallet/balance';
    return apiRequest<WalletBalanceResponse>(url);
  },

  async recharge(amount: number, userId?: string): Promise<{
    status: string;
    new_balance: number;
    transaction: Transaction;
  }> {
    return apiRequest('/api/wallet/recharge', {
      method: 'POST',
      body: JSON.stringify({ amount, user_id: userId })
    });
  },

  async transfer(data: {
    receiver: string;
    amount: number;
    description?: string;
    sender_id?: string;
  }): Promise<{
    status: string;
    transaction_id: string;
    dnn_prediction: 'normal' | 'suspicious';
    anomaly_probability: number;
    risk_level: string;
    explanation: string;
    sender_balance: number;
    transaction: Transaction;
  }> {
    return apiRequest('/api/wallet/transfer', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};
