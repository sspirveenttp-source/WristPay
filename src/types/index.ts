export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  wallet_balance: number;
  wristwatch_id: string;
  avatar_url?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  transaction_id: string;
  sender_id: string;
  sender_name: string;
  receiver_id: string;
  receiver_name: string;
  amount: number;
  description: string;
  timestamp: string;
  device_id: string;
  terminal_id: string;
  status: 'COMPLETED' | 'FLAGGED' | 'REJECTED';
  dnn_prediction: 'normal' | 'suspicious';
  anomaly_probability: number;
  risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL';
  explanation: string;
  reasons: string[];
  created_at: string;
}

export interface IoTDevice {
  id: string;
  device_id: string;
  device_name: string;
  user_id: string;
  user_name: string;
  status: 'Online' | 'Offline' | 'Warning' | 'Disconnected';
  battery: number;
  wifi_status: 'Connected' | 'Weak' | 'Disconnected';
  nfc_status: 'Ready' | 'Active' | 'Error';
  firmware_version: string;
  last_seen: string;
  mac_address: string;
}

export interface PaymentTerminal {
  terminal_id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline';
  connection: string;
  nfc_protocol: string;
  last_transaction_id: string;
}

export interface Alert {
  id: string;
  alert_id: string;
  transaction_id?: string;
  device_id?: string;
  alert_type: 'Suspicious Transaction' | 'Device Disconnected' | 'Multiple Failed Transactions' | 'Unusual Spending' | 'Low Battery Warning';
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM' | 'LOW';
  message: string;
  created_at: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface AppNotification {
  id: string;
  user_id: string;
  type: 'PAYMENT_SUCCESS' | 'PAYMENT_RECEIVED' | 'SUSPICIOUS_ALERT' | 'WALLET_RECHARGE' | 'DEVICE_CONNECTED' | 'DEVICE_DISCONNECTED';
  title: string;
  message: string;
  amount?: number;
  read: boolean;
  created_at: string;
}

export interface DNNMetrics {
  model_name: string;
  architecture: string;
  activation?: string;
  dataset_size: number;
  train_samples?: number;
  test_samples?: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  threshold: number;
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  feature_importance: Array<{
    feature: string;
    weight: number;
    category: string;
  }>;
}

export interface AdminStats {
  total_users: number;
  active_devices: number;
  total_devices: number;
  total_transactions: number;
  total_volume: number;
  suspicious_transactions: number;
  anomaly_rate: number;
  normal_transactions: number;
  open_alerts: number;
}
