import { apiRequest } from './api';
import { DNNMetrics } from '../types';

export interface DNNEvaluationRequest {
  amount: number;
  hour_of_day?: number;
  interval_sec?: number;
  velocity_1h?: number;
  hist_avg_amount?: number;
}

export interface DNNEvaluationResponse {
  prediction: 'normal' | 'suspicious';
  anomaly_probability: number;
  anomaly_percentage: number;
  risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL';
  explanation: string;
  reasons: string[];
  features: {
    amount: number;
    hist_avg: number;
    deviation_z: number;
    velocity_1h: number;
    interval_sec: number;
    hour_of_day: number;
  };
}

export const dnnService = {
  async getMetrics(): Promise<DNNMetrics> {
    return apiRequest<DNNMetrics>('/api/dnn/metrics');
  },

  async evaluateFeatures(req: DNNEvaluationRequest): Promise<DNNEvaluationResponse> {
    return apiRequest<DNNEvaluationResponse>('/api/dnn/evaluate', {
      method: 'POST',
      body: JSON.stringify(req)
    });
  }
};
