import { apiRequest } from './api';
import { Transaction } from '../types';

export interface TransactionFilter {
  user_id?: string;
  status?: string;
  type?: 'sent' | 'received' | 'all';
  search?: string;
}

export const transactionService = {
  async getTransactions(filter?: TransactionFilter): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filter?.user_id) params.set('user_id', filter.user_id);
    if (filter?.status) params.set('status', filter.status);
    if (filter?.type && filter.type !== 'all') params.set('type', filter.type);
    if (filter?.search) params.set('search', filter.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await apiRequest<{ transactions: Transaction[] }>(`/api/transactions${query}`);
    return res.transactions;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const res = await apiRequest<{ transaction: Transaction }>(`/api/transactions/${id}`);
    return res.transaction;
  }
};
