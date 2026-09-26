import { apiRequest } from './api';

export interface ChatResponse {
  reply: string;
  provider: string;
}

export const assistantService = {
  async sendMessage(message: string, userId?: string): Promise<ChatResponse> {
    return apiRequest<ChatResponse>('/api/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message, user_id: userId })
    });
  }
};
