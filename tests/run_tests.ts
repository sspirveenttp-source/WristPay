/**
 * WristPay AI - Comprehensive Integration & Security Test Suite
 * Tests Authentication, Wallet, Transactions, DNN Prediction, IoT API, Device Auth, and Admin Rules.
 */

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

async function runTestSuite(baseUrl = 'http://localhost:3000') {
  console.log('====================================================');
  console.log('Starting WristPay AI Verification Test Suite');
  console.log(`Target: ${baseUrl}`);
  console.log('====================================================\n');

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      results.push({ name, passed: true });
      console.log(`[PASS] ${name}`);
    } catch (e: any) {
      results.push({ name, passed: false, error: e.message });
      console.error(`[FAIL] ${name}: ${e.message}`);
    }
  }

  // 1. Authentication Tests
  await test('Auth: Demo User Login succeeds', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@wristpay.ai', password: 'Demo@12345' })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.token || data.user.email !== 'demo@wristpay.ai') {
      throw new Error('Invalid login payload');
    }
  });

  await test('Auth: Invalid password rejected', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@wristpay.ai', password: 'WrongPassword' })
    });
    if (res.status !== 401) throw new Error(`Expected 401, got ${res.status}`);
  });

  // 2. Wallet & Recharge Tests
  await test('Wallet: Balance fetch returns valid numeric values', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/balance?user_id=USER-001`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (typeof data.wallet_balance !== 'number') throw new Error('wallet_balance missing or non-number');
  });

  await test('Wallet: Demo recharge credits balance', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/recharge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'USER-001', amount: 500 })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'success' || !data.transaction) throw new Error('Recharge failed');
  });

  // 3. Transactions & DNN Prediction Tests
  await test('Transactions: Normal payment transfers funds and gets NORMAL prediction', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: 'USER-001',
        receiver: 'USER-002',
        amount: 150,
        description: 'Test normal coffee tap'
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.dnn_prediction !== 'normal') throw new Error(`Expected normal, got ${data.dnn_prediction}`);
  });

  await test('Transactions: Suspicious sudden 12,000 transfer triggers DNN anomaly flag', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: 'USER-001',
        receiver: 'USER-003',
        amount: 10000,
        description: 'Sudden spike transfer'
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.dnn_prediction !== 'suspicious') throw new Error('Expected suspicious flag for ₹10,000 spike');
  });

  await test('Transactions: Insufficient balance rejected with error', async () => {
    const res = await fetch(`${baseUrl}/api/wallet/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender_id: 'USER-001',
        receiver: 'USER-002',
        amount: 99999999,
        description: 'Overdraw attempt'
      })
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
  });

  // 4. Future ESP32 / IoT API Tests
  await test('IoT API: Valid ESP32 NFC transaction (POST /api/iot/transaction) settles correctly', async () => {
    const res = await fetch(`${baseUrl}/api/iot/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wristwatch_id: 'WP-001',
        terminal_id: 'TERM-001',
        sender_id: 'USER-001',
        receiver_id: 'USER-004',
        amount: 120,
        timestamp: new Date().toISOString()
      })
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'success' || !data.transaction_id) {
      throw new Error('IoT API did not return success status');
    }
  });

  await test('IoT API: Unregistered wristwatch ID is rejected with 403', async () => {
    const res = await fetch(`${baseUrl}/api/iot/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wristwatch_id: 'WP-UNKNOWN-999',
        terminal_id: 'TERM-001',
        amount: 100
      })
    });
    if (res.status !== 403) throw new Error(`Expected 403 for unauthorized device, got ${res.status}`);
  });

  // 5. Admin & Alert Tests
  await test('Admin: Stats endpoint returns total users, devices, and anomaly counts', async () => {
    const res = await fetch(`${baseUrl}/api/admin/stats`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.total_users < 1 || data.total_devices < 1) throw new Error('Admin stats returned empty dataset');
  });

  console.log('\n====================================================');
  const passed = results.filter((r) => r.passed).length;
  console.log(`Results: ${passed} / ${results.length} tests passed.`);
  console.log('====================================================');
}

// Run if directly executed
if (typeof process !== 'undefined' && process.argv[1]?.includes('run_tests')) {
  runTestSuite().catch(console.error);
}

export { runTestSuite };
