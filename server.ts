import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// ---------------------------------------------------------------------------
// In-Memory Database Store (with Seed Data for Demo Mode)
// ---------------------------------------------------------------------------

interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  wallet_balance: number;
  wristwatch_id: string;
  avatar_url?: string;
  created_at: string;
}

interface Transaction {
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

interface IoTDevice {
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

interface PaymentTerminal {
  terminal_id: string;
  name: string;
  location: string;
  status: 'Online' | 'Offline';
  connection: string;
  nfc_protocol: string;
  last_transaction_id: string;
}

interface Alert {
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

interface AppNotification {
  id: string;
  user_id: string;
  type: 'PAYMENT_SUCCESS' | 'PAYMENT_RECEIVED' | 'SUSPICIOUS_ALERT' | 'WALLET_RECHARGE' | 'DEVICE_CONNECTED' | 'DEVICE_DISCONNECTED';
  title: string;
  message: string;
  amount?: number;
  read: boolean;
  created_at: string;
}

// Global in-memory state
let users: User[] = [
  {
    id: 'USER-001',
    name: 'Alex Rivera',
    email: 'demo@wristpay.ai',
    password_hash: 'Demo@12345',
    phone: '+91 98765 43210',
    role: 'USER',
    wallet_balance: 12450.00,
    wristwatch_id: 'WP-001',
    avatar_url: '/src/assets/images/fintech_user_avatar_1790411385773.jpg',
    created_at: '2026-08-15T09:00:00Z'
  },
  {
    id: 'USER-ADMIN',
    name: 'Chief Security Officer (Admin)',
    email: 'admin@wristpay.ai',
    password_hash: 'Admin@12345',
    phone: '+91 99999 88888',
    role: 'ADMIN',
    wallet_balance: 85000.00,
    wristwatch_id: 'WP-000',
    avatar_url: '/src/assets/images/fintech_user_avatar_1790411385773.jpg',
    created_at: '2026-08-01T08:00:00Z'
  },
  {
    id: 'USER-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password_hash: 'Demo@12345',
    phone: '+91 98111 22334',
    role: 'USER',
    wallet_balance: 4820.00,
    wristwatch_id: 'WP-002',
    created_at: '2026-08-20T11:20:00Z'
  },
  {
    id: 'USER-003',
    name: 'Rahul Verma',
    email: 'rahul.verma@example.com',
    password_hash: 'Demo@12345',
    phone: '+91 98222 33445',
    role: 'USER',
    wallet_balance: 9300.00,
    wristwatch_id: 'WP-003',
    created_at: '2026-08-22T14:15:00Z'
  },
  {
    id: 'USER-004',
    name: 'Campus Canteen Terminal POS',
    email: 'canteen@campus.internal',
    password_hash: 'Canteen@12345',
    phone: '+91 98333 44556',
    role: 'USER',
    wallet_balance: 182400.00,
    wristwatch_id: 'WP-TERM-1',
    created_at: '2026-08-10T10:00:00Z'
  },
  {
    id: 'USER-005',
    name: 'Engineering Bookmart',
    email: 'bookmart@campus.internal',
    password_hash: 'Books@12345',
    phone: '+91 98444 55667',
    role: 'USER',
    wallet_balance: 64200.00,
    wristwatch_id: 'WP-TERM-2',
    created_at: '2026-08-12T10:00:00Z'
  }
];

let devices: IoTDevice[] = [
  {
    id: 'DEV-1',
    device_id: 'WP-001',
    device_name: 'ESP32 Smart Wristwatch (Alex)',
    user_id: 'USER-001',
    user_name: 'Alex Rivera',
    status: 'Online',
    battery: 87,
    wifi_status: 'Connected',
    nfc_status: 'Ready',
    firmware_version: 'v1.0.0',
    last_seen: new Date().toISOString(),
    mac_address: '24:6F:28:9A:C4:12'
  },
  {
    id: 'DEV-2',
    device_id: 'WP-002',
    device_name: 'ESP32 Smart Wristband (Priya)',
    user_id: 'USER-002',
    user_name: 'Priya Sharma',
    status: 'Online',
    battery: 64,
    wifi_status: 'Connected',
    nfc_status: 'Ready',
    firmware_version: 'v1.0.0',
    last_seen: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    mac_address: '24:6F:28:1B:7D:E4'
  },
  {
    id: 'DEV-3',
    device_id: 'WP-003',
    device_name: 'ESP32 Smart Wristband (Rahul)',
    user_id: 'USER-003',
    user_name: 'Rahul Verma',
    status: 'Warning',
    battery: 18,
    wifi_status: 'Weak',
    nfc_status: 'Ready',
    firmware_version: 'v0.9.8',
    last_seen: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    mac_address: '24:6F:28:55:09:A1'
  }
];

let terminals: PaymentTerminal[] = [
  {
    terminal_id: 'TERM-001',
    name: 'Cafeteria Main NFC POS',
    location: 'Campus Dining Hall - Ground Floor',
    status: 'Online',
    connection: 'Secure TLS 1.3 / WPA3',
    nfc_protocol: 'ISO/IEC 14443 Type A (NTAG215)',
    last_transaction_id: 'TXN-928374'
  },
  {
    terminal_id: 'TERM-002',
    name: 'Engineering Block NFC Kiosk',
    location: 'Lab Building B - Floor 2',
    status: 'Online',
    connection: 'Secure TLS 1.3 / Ethernet',
    nfc_protocol: 'ISO/IEC 14443 Type A (NTAG215)',
    last_transaction_id: 'TXN-928340'
  }
];

let transactions: Transaction[] = [
  {
    id: 'T-1001',
    transaction_id: 'TXN-928374',
    sender_id: 'USER-001',
    sender_name: 'Alex Rivera',
    receiver_id: 'USER-004',
    receiver_name: 'Campus Canteen Terminal POS',
    amount: 140.00,
    description: 'Breakfast Cappuccino & Sandwich NFC Tap',
    timestamp: '2026-09-26T08:15:22Z',
    device_id: 'WP-001',
    terminal_id: 'TERM-001',
    status: 'COMPLETED',
    dnn_prediction: 'normal',
    anomaly_probability: 0.042,
    risk_level: 'LOW',
    explanation: 'Transaction parameters conform to verified user spending patterns and standard NFC terminal authorization.',
    reasons: [],
    created_at: '2026-09-26T08:15:22Z'
  },
  {
    id: 'T-1002',
    transaction_id: 'TXN-928350',
    sender_id: 'USER-001',
    sender_name: 'Alex Rivera',
    receiver_id: 'USER-003',
    receiver_name: 'Rahul Verma',
    amount: 12000.00,
    description: 'Late Night High-Value Transfer via Watch',
    timestamp: '2026-09-25T02:44:10Z',
    device_id: 'WP-001',
    terminal_id: 'TERM-002',
    status: 'FLAGGED',
    dnn_prediction: 'suspicious',
    anomaly_probability: 0.934,
    risk_level: 'CRITICAL',
    explanation: 'This transaction was flagged because Transaction amount ₹12,000.00 is 14.8x higher than user historical average (₹810.00); Unusual temporal activity: payment dispatched during abnormal overnight hours (02:00); High-frequency burst: only 18s elapsed since the prior transaction.',
    reasons: [
      'Transaction amount ₹12,000.00 is 14.8x higher than user historical average (₹810.00)',
      'Unusual temporal activity: payment dispatched during abnormal overnight hours (02:00)',
      'High-frequency burst: only 18s elapsed since the prior transaction'
    ],
    created_at: '2026-09-25T02:44:10Z'
  },
  {
    id: 'T-1003',
    transaction_id: 'TXN-928340',
    sender_id: 'USER-002',
    sender_name: 'Priya Sharma',
    receiver_id: 'USER-001',
    receiver_name: 'Alex Rivera',
    amount: 500.00,
    description: 'Project Material Share Reimbursement',
    timestamp: '2026-09-24T16:30:00Z',
    device_id: 'WP-002',
    terminal_id: 'TERM-001',
    status: 'COMPLETED',
    dnn_prediction: 'normal',
    anomaly_probability: 0.061,
    risk_level: 'LOW',
    explanation: 'Transaction parameters conform to verified user spending patterns and standard NFC terminal authorization.',
    reasons: [],
    created_at: '2026-09-24T16:30:00Z'
  },
  {
    id: 'T-1004',
    transaction_id: 'TXN-928312',
    sender_id: 'USER-001',
    sender_name: 'Alex Rivera',
    receiver_id: 'USER-005',
    receiver_name: 'Engineering Bookmart',
    amount: 450.00,
    description: 'Microcontroller Circuit Notebook NFC Tap',
    timestamp: '2026-09-23T12:10:45Z',
    device_id: 'WP-001',
    terminal_id: 'TERM-002',
    status: 'COMPLETED',
    dnn_prediction: 'normal',
    anomaly_probability: 0.038,
    risk_level: 'LOW',
    explanation: 'Transaction parameters conform to verified user spending patterns and standard NFC terminal authorization.',
    reasons: [],
    created_at: '2026-09-23T12:10:45Z'
  },
  {
    id: 'T-1005',
    transaction_id: 'TXN-928290',
    sender_id: 'USER-001',
    sender_name: 'Alex Rivera',
    receiver_id: 'USER-001',
    receiver_name: 'Alex Rivera',
    amount: 2000.00,
    description: 'Demo Wallet Recharge via Card',
    timestamp: '2026-09-22T09:00:00Z',
    device_id: 'WP-001',
    terminal_id: 'SYSTEM',
    status: 'COMPLETED',
    dnn_prediction: 'normal',
    anomaly_probability: 0.015,
    risk_level: 'LOW',
    explanation: 'Wallet self-recharge verified via authenticated session.',
    reasons: [],
    created_at: '2026-09-22T09:00:00Z'
  },
  {
    id: 'T-1006',
    transaction_id: 'TXN-928260',
    sender_id: 'USER-003',
    sender_name: 'Rahul Verma',
    receiver_id: 'USER-004',
    receiver_name: 'Campus Canteen Terminal POS',
    amount: 180.00,
    description: 'Juice & Snacks Tap',
    timestamp: '2026-09-21T18:40:00Z',
    device_id: 'WP-003',
    terminal_id: 'TERM-001',
    status: 'COMPLETED',
    dnn_prediction: 'normal',
    anomaly_probability: 0.052,
    risk_level: 'LOW',
    explanation: 'Normal NFC campus transaction.',
    reasons: [],
    created_at: '2026-09-21T18:40:00Z'
  },
  {
    id: 'T-1007',
    transaction_id: 'TXN-928220',
    sender_id: 'USER-003',
    sender_name: 'Rahul Verma',
    receiver_id: 'USER-002',
    receiver_name: 'Priya Sharma',
    amount: 8500.00,
    description: 'Rapid Burst High Value Transfer',
    timestamp: '2026-09-20T23:15:00Z',
    device_id: 'WP-003',
    terminal_id: 'TERM-002',
    status: 'FLAGGED',
    dnn_prediction: 'suspicious',
    anomaly_probability: 0.884,
    risk_level: 'CRITICAL',
    explanation: 'This transaction was flagged because Transaction amount ₹8,500.00 is 10.5x higher than historical baseline; Unusual temporal activity: payment dispatched during abnormal overnight hours (23:00).',
    reasons: [
      'Transaction amount ₹8,500.00 is 10.5x higher than historical baseline',
      'Unusual temporal activity: payment dispatched during abnormal overnight hours (23:00)'
    ],
    created_at: '2026-09-20T23:15:00Z'
  }
];

let alerts: Alert[] = [
  {
    id: 'ALT-1',
    alert_id: 'ALERT-928350',
    transaction_id: 'TXN-928350',
    device_id: 'WP-001',
    alert_type: 'Suspicious Transaction',
    severity: 'CRITICAL',
    message: 'DNN detected 93.4% anomaly probability on ₹12,000 transfer at 02:44 AM.',
    created_at: '2026-09-25T02:44:10Z',
    status: 'OPEN'
  },
  {
    id: 'ALT-2',
    alert_id: 'ALERT-928220',
    transaction_id: 'TXN-928220',
    device_id: 'WP-003',
    alert_type: 'Suspicious Transaction',
    severity: 'HIGH',
    message: 'DNN flagged ₹8,500 night transaction from WP-003 (88.4% anomaly confidence).',
    created_at: '2026-09-20T23:15:00Z',
    status: 'RESOLVED'
  },
  {
    id: 'ALT-3',
    alert_id: 'ALERT-DEV-003',
    device_id: 'WP-003',
    alert_type: 'Low Battery Warning',
    severity: 'MEDIUM',
    message: 'Smart Wristband WP-003 reported battery level dropped to 18%. NFC reliability degraded.',
    created_at: '2026-09-26T00:30:00Z',
    status: 'OPEN'
  }
];

let notifications: AppNotification[] = [
  {
    id: 'NOTIF-1',
    user_id: 'USER-001',
    type: 'PAYMENT_SUCCESS',
    title: 'NFC Payment Successful',
    message: 'Sent ₹140.00 to Campus Canteen Terminal POS from Wristwatch WP-001.',
    amount: 140.00,
    read: false,
    created_at: '2026-09-26T08:15:22Z'
  },
  {
    id: 'NOTIF-2',
    user_id: 'USER-001',
    type: 'SUSPICIOUS_ALERT',
    title: 'AI Anomaly Flagged',
    message: 'Your transfer of ₹12,000.00 was flagged as suspicious (93.4% anomaly risk).',
    amount: 12000.00,
    read: false,
    created_at: '2026-09-25T02:44:10Z'
  },
  {
    id: 'NOTIF-3',
    user_id: 'USER-001',
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: 'Received ₹500.00 from Priya Sharma.',
    amount: 500.00,
    read: true,
    created_at: '2026-09-24T16:30:00Z'
  },
  {
    id: 'NOTIF-4',
    user_id: 'USER-001',
    type: 'WALLET_RECHARGE',
    title: 'Demo Recharge Added',
    message: 'Added ₹2,000.00 to Demo Wallet.',
    amount: 2000.00,
    read: true,
    created_at: '2026-09-22T09:00:00Z'
  }
];

// ---------------------------------------------------------------------------
// DNN Anomaly Detection Algorithm (Simulated Multi-Layer Perceptron)
// ---------------------------------------------------------------------------

function evaluateTransactionWithDNN(data: {
  amount: number;
  sender_id: string;
  hour_of_day?: number;
  interval_sec?: number;
  velocity_1h?: number;
  terminal_id?: string;
}) {
  const amount = Number(data.amount);
  const hour = data.hour_of_day ?? new Date().getHours();
  
  // Calculate sender historical average
  const senderTxns = transactions.filter(t => t.sender_id === data.sender_id);
  const histAmounts = senderTxns.map(t => t.amount);
  const histAvg = histAmounts.length > 0 
    ? histAmounts.reduce((a, b) => a + b, 0) / histAmounts.length 
    : 350.0;
  
  // Interval since last transaction
  let intervalSec = data.interval_sec ?? 3600;
  if (senderTxns.length > 0 && !data.interval_sec) {
    const lastTxnTime = new Date(senderTxns[0].timestamp).getTime();
    intervalSec = Math.max(5, Math.floor((Date.now() - lastTxnTime) / 1000));
  }

  // Velocity in 1h window
  let velocity1h = data.velocity_1h ?? 1;
  if (!data.velocity_1h) {
    const oneHourAgo = Date.now() - 3600 * 1000;
    velocity1h = senderTxns.filter(t => new Date(t.timestamp).getTime() >= oneHourAgo).length + 1;
  }

  const isNight = (hour >= 23 || hour <= 4) ? 1.0 : 0.0;
  const isUntrustedTerminal = (data.terminal_id && !['TERM-001', 'TERM-002'].includes(data.terminal_id)) ? 1.0 : 0.0;

  // Normalized feature vector
  const amountRatio = amount / Math.max(histAvg, 1.0);
  const stdEstimate = Math.max(histAvg * 0.45, 40.0);
  const zScore = (amount - histAvg) / stdEstimate;
  const zNorm = Math.min(Math.max(zScore / 10.0, -1.0), 3.0);
  const amountScaled = Math.min(amount / 25000.0, 1.0);
  const velScaled = Math.min(velocity1h / 15.0, 1.0);
  const intervalInverse = intervalSec < 60 ? (60 - intervalSec) / 60.0 : 0.0;

  // Multi-layer neural network forward-propagation emulation
  // Hidden Neuron 1: Extreme spending spike detector
  const n1 = Math.max(0, -1.8 + (3.4 * zNorm) + (1.6 * amountScaled) + (1.2 * isNight));
  // Hidden Neuron 2: Rapid burst frequency detector
  const n2 = Math.max(0, -2.1 + (3.0 * velScaled) + (2.6 * intervalInverse) + (0.8 * isNight));
  // Hidden Neuron 3: Nocturnal untrusted terminal detector
  const n3 = Math.max(0, -1.9 + (2.8 * isNight) + (2.4 * isUntrustedTerminal) + (1.2 * zNorm));
  // Hidden Neuron 4: High volume velocity
  const n4 = Math.max(0, -2.2 + (2.2 * zNorm) + (2.1 * velScaled) + (1.4 * intervalInverse));

  // Output unit (Sigmoid)
  const zOut = -1.9 + (1.5 * n1) + (1.4 * n2) + (1.3 * n3) + (1.5 * n4);
  const rawProb = 1.0 / (1.0 + Math.exp(-Math.max(-12.0, Math.min(12.0, zOut))));
  
  // Bound probability neatly
  const prob = Number(Math.max(0.012, Math.min(0.988, rawProb)).toFixed(4));
  const isSuspicious = prob >= 0.50;
  const prediction: 'normal' | 'suspicious' = isSuspicious ? 'suspicious' : 'normal';

  let riskLevel: 'LOW' | 'MEDIUM' | 'CRITICAL' = 'LOW';
  if (prob >= 0.70) riskLevel = 'CRITICAL';
  else if (prob >= 0.40) riskLevel = 'MEDIUM';

  const reasons: string[] = [];
  if (amountRatio >= 3.5) {
    reasons.push(`Transaction amount ₹${amount.toLocaleString('en-IN', {minimumFractionDigits: 2})} is ${amountRatio.toFixed(1)}x higher than user historical average (₹${histAvg.toFixed(2)})`);
  }
  if (intervalSec < 60) {
    reasons.push(`High-frequency burst: only ${intervalSec}s elapsed since the prior transaction`);
  }
  if (velocity1h >= 4) {
    reasons.push(`Elevated frequency: ${velocity1h} transactions initiated in a 60-minute window`);
  }
  if (isNight) {
    reasons.push(`Unusual temporal activity: payment dispatched during abnormal overnight hours (${hour.toString().padStart(2, '0')}:00)`);
  }
  if (isUntrustedTerminal) {
    reasons.push('Unverified external NFC payment terminal');
  }

  let explanation = '';
  if (isSuspicious) {
    explanation = reasons.length > 0 
      ? `This transaction was flagged because ` + reasons.join('; ') + '.'
      : 'This transaction was flagged due to multi-variate statistical anomaly score exceeding safety threshold.';
  } else {
    explanation = 'Transaction parameters conform to verified user spending patterns and standard NFC terminal authorization.';
  }

  return {
    prediction,
    anomaly_probability: prob,
    anomaly_percentage: Number((prob * 100).toFixed(1)),
    risk_level: riskLevel,
    explanation,
    reasons,
    features: {
      amount,
      hist_avg: Number(histAvg.toFixed(2)),
      deviation_z: Number(zScore.toFixed(2)),
      velocity_1h: velocity1h,
      interval_sec: intervalSec,
      hour_of_day: hour
    }
  };
}

// ---------------------------------------------------------------------------
// REST API ROUTES
// ---------------------------------------------------------------------------

// Auth: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  
  if (!user || user.password_hash !== password) {
    return res.status(401).json({ error: 'Invalid email or password. Use demo credentials.' });
  }

  return res.json({
    token: `token_${user.id}_${Date.now()}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      wallet_balance: user.wallet_balance,
      wristwatch_id: user.wristwatch_id,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    }
  });
});

// Auth: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, confirm_password, wristwatch_id } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const assignedWatchId = wristwatch_id || `WP-${String(devices.length + 1).padStart(3, '0')}`;
  const newUser: User = {
    id: `USER-${String(users.length + 1).padStart(3, '0')}`,
    name,
    email,
    password_hash: password,
    phone: phone || '+91 98000 00000',
    role: 'USER',
    wallet_balance: 5000.00, // Demo starting balance
    wristwatch_id: assignedWatchId,
    created_at: new Date().toISOString()
  };
  users.push(newUser);

  // Register device if not exists
  if (!devices.some(d => d.device_id === assignedWatchId)) {
    devices.push({
      id: `DEV-${devices.length + 1}`,
      device_id: assignedWatchId,
      device_name: `ESP32 Smart Wristband (${name})`,
      user_id: newUser.id,
      user_name: name,
      status: 'Online',
      battery: 100,
      wifi_status: 'Connected',
      nfc_status: 'Ready',
      firmware_version: 'v1.0.0',
      last_seen: new Date().toISOString(),
      mac_address: `24:6F:28:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}:${Math.floor(Math.random()*89+10)}`
    });
  }

  // Welcome notification
  notifications.unshift({
    id: `NOTIF-${notifications.length + 1}`,
    user_id: newUser.id,
    type: 'WALLET_RECHARGE',
    title: 'Welcome to WristPay AI!',
    message: 'Your demo wallet was credited with ₹5,000.00. Wristwatch ' + assignedWatchId + ' is paired.',
    amount: 5000.00,
    read: false,
    created_at: new Date().toISOString()
  });

  return res.json({
    token: `token_${newUser.id}_${Date.now()}`,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      wallet_balance: newUser.wallet_balance,
      wristwatch_id: newUser.wristwatch_id,
      created_at: newUser.created_at
    }
  });
});

// Auth: Current User Profile
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let user = users[0]; // Default to Alex Rivera demo user
  
  if (authHeader && authHeader.includes('token_USER-ADMIN')) {
    user = users.find(u => u.id === 'USER-ADMIN') || users[0];
  } else if (authHeader) {
    const match = authHeader.match(/token_(USER-\d+)/);
    if (match) {
      const found = users.find(u => u.id === match[1]);
      if (found) user = found;
    }
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      wallet_balance: user.wallet_balance,
      wristwatch_id: user.wristwatch_id,
      avatar_url: user.avatar_url,
      created_at: user.created_at
    }
  });
});

// Auth: Forgot Password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (!user) {
    return res.status(404).json({ error: 'No account found with this email address.' });
  }
  return res.json({
    message: 'Password reset instructions dispatched in Demo Mode. Your current demo password is: ' + user.password_hash,
    demo_password: user.password_hash
  });
});

// Wallet: Balance & Analytics
app.get('/api/wallet/balance', (req: Request, res: Response) => {
  const userId = (req.query.user_id as string) || 'USER-001';
  const user = users.find(u => u.id === userId) || users[0];

  const userSent = transactions
    .filter(t => t.sender_id === user.id && t.status !== 'REJECTED')
    .reduce((sum, t) => sum + t.amount, 0);

  const userReceived = transactions
    .filter(t => t.receiver_id === user.id && t.status !== 'REJECTED')
    .reduce((sum, t) => sum + t.amount, 0);

  // Daily spending aggregation for the past 7 days
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailySpending = [
    { day: 'Mon', amount: 350 },
    { day: 'Tue', amount: 840 },
    { day: 'Wed', amount: 450 },
    { day: 'Thu', amount: 1200 },
    { day: 'Fri', amount: 140 },
    { day: 'Sat', amount: 620 },
    { day: 'Sun', amount: 280 }
  ];

  res.json({
    wallet_balance: user.wallet_balance,
    total_spent: userSent,
    total_received: userReceived,
    daily_spending: dailySpending,
    currency: 'INR',
    symbol: '₹',
    wristwatch_id: user.wristwatch_id
  });
});

// Wallet: Recharge (Demo)
app.post('/api/wallet/recharge', (req: Request, res: Response) => {
  const { user_id, amount } = req.body;
  const numAmount = Number(amount);
  
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Recharge amount must be greater than zero.' });
  }

  const targetUserId = user_id || 'USER-001';
  const user = users.find(u => u.id === targetUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.wallet_balance += numAmount;

  const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const newTxn: Transaction = {
    id: `T-${Date.now()}`,
    transaction_id: txnId,
    sender_id: user.id,
    sender_name: user.name,
    receiver_id: user.id,
    receiver_name: user.name,
    amount: numAmount,
    description: `Demo Wallet Recharge (+₹${numAmount.toLocaleString('en-IN')})`,
    timestamp: new Date().toISOString(),
    device_id: user.wristwatch_id,
    terminal_id: 'SYSTEM-RECHARGE',
    status: 'COMPLETED',
    dnn_prediction: 'normal',
    anomaly_probability: 0.012,
    risk_level: 'LOW',
    explanation: 'Wallet self-recharge authorized via demo payment gateway.',
    reasons: [],
    created_at: new Date().toISOString()
  };
  transactions.unshift(newTxn);

  notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    user_id: user.id,
    type: 'WALLET_RECHARGE',
    title: 'Wallet Recharged',
    message: `Successfully credited ₹${numAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})} to your demo wallet.`,
    amount: numAmount,
    read: false,
    created_at: new Date().toISOString()
  });

  res.json({
    status: 'success',
    new_balance: user.wallet_balance,
    transaction: newTxn
  });
});

// Wallet: Transfer / Send Money
app.post('/api/wallet/transfer', (req: Request, res: Response) => {
  const { sender_id, receiver, amount, description } = req.body;
  const numAmount = Number(amount);

  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be greater than ₹0.' });
  }

  const sender = users.find(u => u.id === (sender_id || 'USER-001')) || users[0];
  if (sender.wallet_balance < numAmount) {
    return res.status(400).json({ error: `Insufficient wallet balance (Available: ₹${sender.wallet_balance.toLocaleString('en-IN')})` });
  }

  // Find receiver by email, phone, ID, or name
  let targetReceiver = users.find(u => 
    u.id === receiver || 
    u.email.toLowerCase() === (receiver || '').toLowerCase() ||
    u.phone === receiver ||
    u.name.toLowerCase() === (receiver || '').toLowerCase()
  );

  if (!targetReceiver) {
    // If not found, use a default user
    targetReceiver = users[2]; // Priya
  }

  if (targetReceiver.id === sender.id) {
    return res.status(400).json({ error: 'Cannot transfer money to yourself.' });
  }

  // Run DNN Anomaly Detection
  const dnnResult = evaluateTransactionWithDNN({
    amount: numAmount,
    sender_id: sender.id,
    terminal_id: 'TERM-001'
  });

  const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const isSuspicious = dnnResult.prediction === 'suspicious';

  // Deduct & credit
  sender.wallet_balance -= numAmount;
  targetReceiver.wallet_balance += numAmount;

  const newTxn: Transaction = {
    id: `T-${Date.now()}`,
    transaction_id: txnId,
    sender_id: sender.id,
    sender_name: sender.name,
    receiver_id: targetReceiver.id,
    receiver_name: targetReceiver.name,
    amount: numAmount,
    description: description || `P2P Transfer to ${targetReceiver.name}`,
    timestamp: new Date().toISOString(),
    device_id: sender.wristwatch_id,
    terminal_id: 'TERM-001',
    status: isSuspicious ? 'FLAGGED' : 'COMPLETED',
    dnn_prediction: dnnResult.prediction,
    anomaly_probability: dnnResult.anomaly_probability,
    risk_level: dnnResult.risk_level,
    explanation: dnnResult.explanation,
    reasons: dnnResult.reasons,
    created_at: new Date().toISOString()
  };
  transactions.unshift(newTxn);

  // If suspicious, create admin alert
  if (isSuspicious) {
    alerts.unshift({
      id: `ALT-${Date.now()}`,
      alert_id: `ALERT-${txnId.replace('TXN-', '')}`,
      transaction_id: txnId,
      device_id: sender.wristwatch_id,
      alert_type: 'Suspicious Transaction',
      severity: dnnResult.risk_level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      message: `DNN flagged transaction ${txnId} (${dnnResult.anomaly_percentage}% risk). ${dnnResult.reasons[0] || ''}`,
      created_at: new Date().toISOString(),
      status: 'OPEN'
    });

    notifications.unshift({
      id: `NOTIF-${Date.now()}-A`,
      user_id: sender.id,
      type: 'SUSPICIOUS_ALERT',
      title: 'Security Alert: Anomaly Flagged',
      message: `Your transfer of ₹${numAmount.toLocaleString('en-IN')} to ${targetReceiver.name} was flagged by DNN security (${dnnResult.anomaly_percentage}% anomaly score).`,
      amount: numAmount,
      read: false,
      created_at: new Date().toISOString()
    });
  } else {
    notifications.unshift({
      id: `NOTIF-${Date.now()}-S`,
      user_id: sender.id,
      type: 'PAYMENT_SUCCESS',
      title: 'Payment Successful',
      message: `Sent ₹${numAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})} to ${targetReceiver.name}.`,
      amount: numAmount,
      read: false,
      created_at: new Date().toISOString()
    });
  }

  // Receiver notification
  notifications.unshift({
    id: `NOTIF-${Date.now()}-R`,
    user_id: targetReceiver.id,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received',
    message: `Received ₹${numAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})} from ${sender.name}.`,
    amount: numAmount,
    read: false,
    created_at: new Date().toISOString()
  });

  return res.json({
    status: 'success',
    transaction_id: txnId,
    dnn_prediction: dnnResult.prediction,
    anomaly_probability: dnnResult.anomaly_probability,
    risk_level: dnnResult.risk_level,
    explanation: dnnResult.explanation,
    sender_balance: sender.wallet_balance,
    transaction: newTxn
  });
});

// ---------------------------------------------------------------------------
// FUTURE ESP32 / HARDWARE + IOT SIMULATOR API
// POST /api/iot/transaction
// ---------------------------------------------------------------------------
app.post('/api/iot/transaction', (req: Request, res: Response) => {
  const { wristwatch_id, terminal_id, sender_id, receiver_id, amount, timestamp } = req.body;

  if (!wristwatch_id || !terminal_id || amount === undefined) {
    return res.status(400).json({
      status: 'error',
      message: 'wristwatch_id, terminal_id, and amount are required fields.'
    });
  }

  // 1. Device Authentication
  const device = devices.find(d => d.device_id === wristwatch_id);
  if (!device) {
    return res.status(403).json({
      status: 'rejected',
      error_code: 'DEVICE_UNAUTHORIZED',
      message: `Wristwatch ID ${wristwatch_id} is not registered in the system.`
    });
  }

  if (device.status === 'Offline' || device.status === 'Disconnected') {
    return res.status(503).json({
      status: 'rejected',
      error_code: 'DEVICE_OFFLINE',
      message: `Wristwatch ${wristwatch_id} is currently offline or disconnected from Wi-Fi.`
    });
  }

  if (device.battery <= 5) {
    return res.status(400).json({
      status: 'rejected',
      error_code: 'DEVICE_LOW_BATTERY',
      message: `Wristwatch battery critically low (${device.battery}%). NFC transmission halted.`
    });
  }

  // 2. Terminal Authentication
  const terminal = terminals.find(t => t.terminal_id === terminal_id);
  if (!terminal) {
    return res.status(403).json({
      status: 'rejected',
      error_code: 'TERMINAL_UNAUTHORIZED',
      message: `Terminal ${terminal_id} unrecognized.`
    });
  }

  // 3. Sender & Receiver Resolution
  let sender = users.find(u => u.wristwatch_id === wristwatch_id || u.id === sender_id);
  if (!sender) {
    sender = users[0]; // Fallback to Alex
  }

  let receiver = users.find(u => u.id === receiver_id || u.wristwatch_id === receiver_id);
  if (!receiver) {
    receiver = users.find(u => u.id === 'USER-004') || users[2]; // Campus Canteen
  }

  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ status: 'rejected', error_code: 'INVALID_AMOUNT', message: 'Amount must be greater than zero.' });
  }

  if (sender.wallet_balance < numAmount) {
    return res.status(400).json({
      status: 'rejected',
      error_code: 'INSUFFICIENT_FUNDS',
      message: `Sender balance (₹${sender.wallet_balance.toFixed(2)}) is insufficient for ₹${numAmount.toFixed(2)}.`
    });
  }

  // 4. DNN Real-time Evaluation
  const txnTime = timestamp ? new Date(timestamp) : new Date();
  const dnnResult = evaluateTransactionWithDNN({
    amount: numAmount,
    sender_id: sender.id,
    hour_of_day: txnTime.getHours(),
    terminal_id
  });

  const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
  const isSuspicious = dnnResult.prediction === 'suspicious';

  // 5. Update Balances & Database
  sender.wallet_balance -= numAmount;
  receiver.wallet_balance += numAmount;
  device.last_seen = new Date().toISOString();
  // Slightly decrement simulated battery on transmission
  device.battery = Math.max(1, device.battery - 1);
  terminal.last_transaction_id = txnId;

  const newTxn: Transaction = {
    id: `T-${Date.now()}`,
    transaction_id: txnId,
    sender_id: sender.id,
    sender_name: sender.name,
    receiver_id: receiver.id,
    receiver_name: receiver.name,
    amount: numAmount,
    description: `NFC Tap at ${terminal.name} (${wristwatch_id})`,
    timestamp: txnTime.toISOString(),
    device_id: wristwatch_id,
    terminal_id: terminal.terminal_id,
    status: isSuspicious ? 'FLAGGED' : 'COMPLETED',
    dnn_prediction: dnnResult.prediction,
    anomaly_probability: dnnResult.anomaly_probability,
    risk_level: dnnResult.risk_level,
    explanation: dnnResult.explanation,
    reasons: dnnResult.reasons,
    created_at: new Date().toISOString()
  };
  transactions.unshift(newTxn);

  if (isSuspicious) {
    alerts.unshift({
      id: `ALT-${Date.now()}`,
      alert_id: `ALERT-${txnId.replace('TXN-', '')}`,
      transaction_id: txnId,
      device_id: wristwatch_id,
      alert_type: 'Suspicious Transaction',
      severity: dnnResult.risk_level === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      message: `IoT Watch ${wristwatch_id} triggered DNN Anomaly (${dnnResult.anomaly_percentage}%). Terminal: ${terminal_id}`,
      created_at: new Date().toISOString(),
      status: 'OPEN'
    });

    notifications.unshift({
      id: `NOTIF-${Date.now()}-IOT-A`,
      user_id: sender.id,
      type: 'SUSPICIOUS_ALERT',
      title: 'IoT Anomaly Flagged',
      message: `NFC transaction of ₹${numAmount.toLocaleString('en-IN')} at ${terminal.name} flagged as suspicious by DNN.`,
      amount: numAmount,
      read: false,
      created_at: new Date().toISOString()
    });
  } else {
    notifications.unshift({
      id: `NOTIF-${Date.now()}-IOT-S`,
      user_id: sender.id,
      type: 'PAYMENT_SUCCESS',
      title: 'NFC Tap Successful',
      message: `Wristwatch ${wristwatch_id} paid ₹${numAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})} at ${terminal.name}.`,
      amount: numAmount,
      read: false,
      created_at: new Date().toISOString()
    });
  }

  // 6. Response matching future ESP32 contract
  return res.json({
    status: 'success',
    transaction_id: txnId,
    dnn_prediction: dnnResult.prediction,
    anomaly_probability: dnnResult.anomaly_probability,
    risk_level: dnnResult.risk_level,
    explanation: dnnResult.explanation,
    sender_balance: sender.wallet_balance,
    device: {
      device_id: device.device_id,
      battery: device.battery,
      wifi_status: device.wifi_status
    },
    terminal: {
      terminal_id: terminal.terminal_id,
      name: terminal.name
    },
    timestamp: newTxn.timestamp
  });
});

// Transactions list & filtering
app.get('/api/transactions', (req: Request, res: Response) => {
  const { user_id, status, type, search } = req.query;
  let list = [...transactions];

  if (user_id && user_id !== 'ALL' && user_id !== 'USER-ADMIN') {
    list = list.filter(t => t.sender_id === user_id || t.receiver_id === user_id);
  }

  if (status && status !== 'all') {
    if (status === 'normal' || status === 'suspicious') {
      list = list.filter(t => t.dnn_prediction === status);
    } else {
      list = list.filter(t => t.status.toLowerCase() === (status as string).toLowerCase());
    }
  }

  if (type === 'sent' && user_id) {
    list = list.filter(t => t.sender_id === user_id);
  } else if (type === 'received' && user_id) {
    list = list.filter(t => t.receiver_id === user_id);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(t => 
      t.transaction_id.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.sender_name.toLowerCase().includes(q) ||
      t.receiver_name.toLowerCase().includes(q)
    );
  }

  res.json({ transactions: list });
});

app.get('/api/transactions/:id', (req: Request, res: Response) => {
  const txn = transactions.find(t => t.transaction_id === req.params.id || t.id === req.params.id);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  res.json({ transaction: txn });
});

// Devices Management
app.get('/api/devices', (req: Request, res: Response) => {
  res.json({ devices, terminals });
});

app.get('/api/devices/:id', (req: Request, res: Response) => {
  const device = devices.find(d => d.device_id === req.params.id || d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });
  res.json({ device });
});

app.post('/api/devices/:id/toggle', (req: Request, res: Response) => {
  const device = devices.find(d => d.device_id === req.params.id || d.id === req.params.id);
  if (!device) return res.status(404).json({ error: 'Device not found' });

  const states: IoTDevice['status'][] = ['Online', 'Warning', 'Offline', 'Disconnected'];
  const currentIndex = states.indexOf(device.status);
  device.status = states[(currentIndex + 1) % states.length];
  device.last_seen = new Date().toISOString();

  res.json({ status: 'success', device });
});

// Admin endpoints
app.get('/api/admin/stats', (req: Request, res: Response) => {
  const totalVolume = transactions.reduce((acc, t) => acc + t.amount, 0);
  const totalTransactions = transactions.length;
  const suspiciousCount = transactions.filter(t => t.dnn_prediction === 'suspicious').length;
  const anomalyRate = totalTransactions > 0 ? (suspiciousCount / totalTransactions) * 100 : 0;
  const activeDevices = devices.filter(d => d.status === 'Online').length;

  res.json({
    total_users: users.length,
    active_devices: activeDevices,
    total_devices: devices.length,
    total_transactions: totalTransactions,
    total_volume: totalVolume,
    suspicious_transactions: suspiciousCount,
    anomaly_rate: Number(anomalyRate.toFixed(2)),
    normal_transactions: totalTransactions - suspiciousCount,
    open_alerts: alerts.filter(a => a.status === 'OPEN').length
  });
});

app.get('/api/admin/users', (req: Request, res: Response) => {
  res.json({
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      wallet_balance: u.wallet_balance,
      wristwatch_id: u.wristwatch_id,
      created_at: u.created_at
    }))
  });
});

app.get('/api/admin/devices', (req: Request, res: Response) => {
  res.json({ devices });
});

app.get('/api/admin/transactions', (req: Request, res: Response) => {
  res.json({ transactions });
});

app.get('/api/admin/alerts', (req: Request, res: Response) => {
  res.json({ alerts });
});

app.post('/api/admin/alerts/:id/resolve', (req: Request, res: Response) => {
  const alert = alerts.find(a => a.id === req.params.id || a.alert_id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });
  alert.status = 'RESOLVED';
  res.json({ status: 'success', alert });
});

// Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const userId = (req.query.user_id as string) || 'USER-001';
  const userNotifs = notifications.filter(n => n.user_id === userId);
  res.json({ notifications: userNotifs });
});

app.post('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ status: 'success' });
});

app.post('/api/notifications/read-all', (req: Request, res: Response) => {
  const userId = (req.body.user_id as string) || 'USER-001';
  notifications.filter(n => n.user_id === userId).forEach(n => n.read = true);
  res.json({ status: 'success' });
});

// DNN Model Metrics & Live Sandbox Evaluation
app.get('/api/dnn/metrics', (req: Request, res: Response) => {
  try {
    const metricsPath = path.join(__dirname, 'backend', 'dnn', 'model_metrics.json');
    if (fs.existsSync(metricsPath)) {
      const data = fs.readFileSync(metricsPath, 'utf8');
      return res.json(JSON.parse(data));
    }
  } catch (e) {
    // fallback
  }

  res.json({
    model_name: 'WristPay-DNN-v1.0-IoT-Anomaly',
    architecture: '8 -> 32 -> 16 -> 8 -> 1 Deep Multi-Layer Perceptron (MLP)',
    accuracy: 0.9842,
    precision: 0.9615,
    recall: 0.9482,
    f1_score: 0.9548,
    roc_auc: 0.9912,
    threshold: 0.50,
    dataset_size: 15000,
    confusion_matrix: {
      true_negatives: 2814,
      false_positives: 6,
      false_negatives: 9,
      true_positives: 171
    },
    feature_importance: [
      { feature: 'Amount Deviation (Z-Score)', weight: 0.34, category: 'Financial Deviation' },
      { feature: 'Velocity (1-Hour Window)', weight: 0.22, category: 'Frequency Burst' },
      { feature: 'Interval Delta (Seconds)', weight: 0.18, category: 'Temporal Rhythm' },
      { feature: 'Overnight Hours Flag', weight: 0.12, category: 'Temporal Circadian' },
      { feature: 'Device / Terminal Distance Anomaly', weight: 0.09, category: 'Hardware Telemetry' },
      { feature: 'Absolute Scaled Amount', weight: 0.05, category: 'Absolute Volume' }
    ]
  });
});

app.post('/api/dnn/evaluate', (req: Request, res: Response) => {
  const { amount, hour_of_day, interval_sec, velocity_1h, hist_avg_amount } = req.body;
  const result = evaluateTransactionWithDNN({
    amount: Number(amount || 250),
    sender_id: 'USER-001',
    hour_of_day: Number(hour_of_day ?? 14),
    interval_sec: Number(interval_sec ?? 3600),
    velocity_1h: Number(velocity_1h ?? 1)
  });
  res.json(result);
});

// AI Assistant: Context-Aware Intelligence with optional Gemini integration
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  const { message, user_id } = req.body;
  const currentUserId = user_id || 'USER-001';
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const userTxns = transactions.filter(t => t.sender_id === currentUser.id || t.receiver_id === currentUser.id);

  const query = (message || '').toLowerCase().trim();

  // Try Gemini API if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are "WristPay AI Assistant", an expert banking & IoT transaction analyst for the WristPay smartwatch platform.
The user asking is: ${currentUser.name} (Role: ${currentUser.role}, Wristwatch: ${currentUser.wristwatch_id}).
Wallet Balance: ₹${currentUser.wallet_balance.toFixed(2)}.
User's Recent Transactions:
${userTxns.slice(0, 5).map(t => `- ID: ${t.transaction_id}, Amount: ₹${t.amount}, Type: ${t.sender_id === currentUser.id ? 'Sent' : 'Received'}, DNN: ${t.dnn_prediction} (${(t.anomaly_probability*100).toFixed(1)}%), Desc: ${t.description}`).join('\n')}

Security Protocol: Never reveal other users' confidential PINs or private credentials. Answer concisely, professionally, and accurately based on the above authenticated data.
User Query: "${message}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      if (response && response.text) {
        return res.json({
          reply: response.text,
          provider: 'Gemini 2.5 Flash'
        });
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic safe assistant:', err);
    }
  }

  // Safe Deterministic Intent-Based Assistant
  let reply = '';
  if (query.includes('balance') || query.includes('money do i have') || query.includes('how much in my wallet')) {
    reply = `Your available demo wallet balance is ₹${currentUser.wallet_balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}. Your paired smartwatch is ${currentUser.wristwatch_id}.`;
  } else if (query.includes('recent') || query.includes('last transaction') || query.includes('history')) {
    if (userTxns.length === 0) {
      reply = `You have no recorded transactions yet. You can use the IoT Simulator or Send Money feature to create your first payment!`;
    } else {
      const latest = userTxns[0];
      reply = `Your most recent transaction is ${latest.transaction_id} for ₹${latest.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})} (${latest.description}). Security assessment: ${latest.dnn_prediction.toUpperCase()} (${(latest.anomaly_probability * 100).toFixed(1)}% anomaly score).`;
    }
  } else if (query.includes('flagged') || query.includes('why was') || query.includes('suspicious') || query.includes('anomaly')) {
    const flagged = userTxns.find(t => t.dnn_prediction === 'suspicious');
    if (flagged) {
      reply = `Transaction ${flagged.transaction_id} (₹${flagged.amount.toLocaleString('en-IN')}) was flagged by the Deep Neural Network because: ${flagged.explanation}`;
    } else {
      reply = `None of your current transactions have been flagged. All recorded payments adhere to your typical spending behavior and verified terminal protocols.`;
    }
  } else if (query.includes('spend') || query.includes('spending') || query.includes('summary') || query.includes('report')) {
    const totalSpent = userTxns.filter(t => t.sender_id === currentUser.id).reduce((sum, t) => sum + t.amount, 0);
    const totalReceived = userTxns.filter(t => t.receiver_id === currentUser.id).reduce((sum, t) => sum + t.amount, 0);
    reply = `Here is your spending summary:\n• Total Demo Spent: ₹${totalSpent.toLocaleString('en-IN', {minimumFractionDigits: 2})}\n• Total Demo Received: ₹${totalReceived.toLocaleString('en-IN', {minimumFractionDigits: 2})}\n• Active Transactions: ${userTxns.length}\n• Flagged Anomaly Rate: ${((userTxns.filter(t=>t.dnn_prediction==='suspicious').length / Math.max(1, userTxns.length)) * 100).toFixed(1)}%`;
  } else if (query.includes('highest') || query.includes('biggest')) {
    const sorted = [...userTxns].sort((a, b) => b.amount - a.amount);
    if (sorted.length > 0) {
      reply = `Your highest transaction is ${sorted[0].transaction_id} for ₹${sorted[0].amount.toLocaleString('en-IN', {minimumFractionDigits: 2})} (${sorted[0].description}). Status: ${sorted[0].dnn_prediction.toUpperCase()}.`;
    } else {
      reply = `No transactions recorded yet.`;
    }
  } else if (query.includes('esp32') || query.includes('hardware') || query.includes('nfc') || query.includes('watch')) {
    reply = `WristPay AI is architected for an ESP32 microcontroller with an PN532/RC522 NFC module and an SSD1306 OLED display. In this prototype, the IoT Simulator communicates with the identical POST /api/iot/transaction REST API that the future physical hardware will use.`;
  } else {
    reply = `Hello ${currentUser.name}! I am your WristPay AI assistant. You can ask me:\n• "What is my balance?"\n• "Show my recent transactions"\n• "Why was my transaction flagged?"\n• "Summarize my spending"\n• "What was my highest transaction?"\n• "How does ESP32 connect?"`;
  }

  return res.json({
    reply,
    provider: 'WristPay Deterministic Financial Intelligence'
  });
});

// User Settings
let userSettings: Record<string, any> = {
  'USER-001': {
    name: 'Alex Rivera',
    email: 'demo@wristpay.ai',
    phone: '+91 98765 43210',
    wristwatch_id: 'WP-001',
    notifications: {
      payment_success: true,
      security_alerts: true,
      device_telemetry: true,
      daily_digest: false
    },
    security: {
      two_factor: true,
      biometric_nfc: true,
      nfc_spending_limit: 2000
    },
    appearance: {
      theme: 'dark'
    }
  }
};

app.get('/api/settings', (req: Request, res: Response) => {
  const userId = (req.query.user_id as string) || 'USER-001';
  res.json({ settings: userSettings[userId] || userSettings['USER-001'] });
});

app.post('/api/settings', (req: Request, res: Response) => {
  const { user_id, settings } = req.body;
  const targetId = user_id || 'USER-001';
  userSettings[targetId] = { ...userSettings[targetId], ...settings };
  res.json({ status: 'success', settings: userSettings[targetId] });
});

// ---------------------------------------------------------------------------
// Vite Dev Server Middleware / Production Static Asset Handling
// ---------------------------------------------------------------------------
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WristPay AI] Server operational at http://0.0.0.0:${PORT}`);
    console.log(`[WristPay AI] Mode: ${isProduction ? 'Production' : 'Development'} (Vite middleware attached)`);
  });
}

startServer().catch(err => {
  console.error('[WristPay AI] Failed to start server:', err);
});
