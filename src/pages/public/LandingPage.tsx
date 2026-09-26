import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Watch,
  Cpu,
  ShieldCheck,
  Zap,
  ArrowRight,
  Activity,
  Layers,
  Sparkles,
  Lock,
  Smartphone,
  CheckCircle2,
  TrendingUp,
  Server
} from 'lucide-react';
import heroWatchImg from '../../assets/images/smartwatch_nfc_terminal_1790411358953.jpg';
import esp32HardwareImg from '../../assets/images/esp32_iot_wearable_1790411374172.jpg';

export const LandingPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { user, quickDemoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Watch className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              WristPay <span className="text-indigo-400">AI</span>
            </span>
          </div>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">Architecture</a>
            <a href="#ai-security" className="hover:text-white transition-colors">DNN Intelligence</a>
            <a href="#hardware" className="hover:text-white transition-colors">ESP32 Hardware</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors flex items-center gap-1.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              IoT + Deep Neural Network FinTech Prototype
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Payments, Reimagined for Your Wrist.
            </h1>

            <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
              An IoT-powered digital wallet with intelligent transaction monitoring using Deep Neural Networks.
              Cashless NFC payment execution coupled with real-time biometric and behavioural anomaly detection.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2"
              >
                <span>Explore Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/iot-simulator')}
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700/80 transition-all flex items-center gap-2"
              >
                <Watch className="w-4 h-4 text-emerald-400" />
                <span>Launch IoT Simulator</span>
              </button>

              <button
                onClick={() => quickDemoLogin('ADMIN').then(() => navigate('/admin'))}
                className="px-4 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-indigo-300 text-xs border border-slate-800 transition-colors"
              >
                Inspect as Admin
              </button>
            </div>

            {/* Quick stats banner */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80">
              <div>
                <span className="text-2xl font-bold font-mono text-white">98.4%</span>
                <span className="block text-xs text-slate-400 mt-0.5">DNN Accuracy</span>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-white">&lt;150ms</span>
                <span className="block text-xs text-slate-400 mt-0.5">NFC Latency</span>
              </div>
              <div>
                <span className="text-2xl font-bold font-mono text-white">Zero</span>
                <span className="block text-xs text-slate-400 mt-0.5">Physical Hardware Needed</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              <img
                src={heroWatchImg}
                alt="WristPay AI Smartwatch Contactless Payment"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex flex-col justify-end p-6">
                <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  NFC ISO/IEC 14443 Type A Ready
                </div>
                <h4 className="text-sm font-semibold text-white">
                  ESP32 Microcontroller + PN532 Contactless Gateway
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Direct REST API transmission: POST /api/iot/transaction with end-to-end TLS authorization.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-slate-900/40 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Fintech Meets Wearable IoT
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every component is built for production reliability, from sub-second edge tap handling to multi-layer neural network risk assessment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/40 flex items-center justify-center text-indigo-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">NFC Contactless Payments</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tap your wrist against any compatible terminal. Simulated NFC protocol executes with zero physical card requirement.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">IoT Hardware Simulator</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test and demonstrate full payment lifecycles on a virtual ESP32 smartwatch complete with battery metrics, OLED display, and Wi-Fi state.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-950/80 border border-violet-700/40 flex items-center justify-center text-violet-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">DNN Anomaly Detection</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deep multi-layer perceptron analyzes 8 transaction dimensions in real time, detecting bursts, velocity anomalies, and nocturnal spikes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-700/40 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">AI Explainability Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No black-box decisions. Flagged transactions include precise mathematical feature attribution explaining the exact deviation causes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-700/40 flex items-center justify-center text-blue-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">WristPay AI Assistant</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Context-aware banking intelligence answering questions about balances, spending categories, and transaction security.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-700/40 flex items-center justify-center text-rose-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white">Full-Fleet Admin Console</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Centralized dashboard managing user wallets, network terminals, device fleet batteries, and high-priority security alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Flowchart */}
      <section id="how-it-works" className="py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">Architecture</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Hardware-Independent Transaction Pipeline
            </h2>
            <p className="text-sm text-slate-400">
              The future physical ESP32 wristwatch and the IoT Simulator use the exact same secure REST API without architectural modification.
            </p>
          </div>

          {/* Interactive Steps */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-mono text-indigo-400">01. Watch</div>
              <h4 className="text-sm font-semibold text-white">ESP32 Device</h4>
              <p className="text-[11px] text-slate-500">Wristwatch WP-001 with secure credential token</p>
            </div>
            
            <div className="text-center text-slate-600 hidden md:block">→</div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-mono text-indigo-400">02. Tap</div>
              <h4 className="text-sm font-semibold text-white">NFC Terminal</h4>
              <p className="text-[11px] text-slate-500">ISO 14443 Type A token transfer to POS</p>
            </div>

            <div className="text-center text-slate-600 hidden md:block">→</div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-2">
              <div className="text-xs font-mono text-indigo-400">03. Gateway</div>
              <h4 className="text-sm font-semibold text-white">REST API</h4>
              <p className="text-[11px] text-slate-500 font-mono">POST /api/iot/transaction</p>
            </div>

            <div className="text-center text-slate-600 hidden md:block">→</div>

            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 text-center space-y-2 bg-indigo-950/20">
              <div className="text-xs font-mono text-indigo-400">04. AI Defense</div>
              <h4 className="text-sm font-semibold text-white">DNN Inference</h4>
              <p className="text-[11px] text-indigo-300">8-feature normalized tensor evaluation</p>
            </div>

            <div className="text-center text-slate-600 hidden md:block">→</div>

            <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 text-center space-y-2 bg-emerald-950/20">
              <div className="text-xs font-mono text-emerald-400">05. Settlement</div>
              <h4 className="text-sm font-semibold text-white">Wallet Update</h4>
              <p className="text-[11px] text-emerald-300">Ledger debit, notification & OLED confirmation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Future ESP32 Hardware Section */}
      <section id="hardware" className="py-20 px-6 bg-slate-900/40 border-t border-slate-800/60">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 relative">
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
              <img
                src={esp32HardwareImg}
                alt="ESP32 IoT Wearable Prototype"
                className="w-full h-auto object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">Future Hardware Architecture</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Designed for ESP32 + PN532 Wearable Integration
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              When physical microcontrollers are ready, zero software rewriting is needed. Flash the ESP32 with our Wi-Fi firmware and target the backend's uniform endpoint.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Microcontroller:</strong> ESP32-WROOM-32 (Dual Core 240MHz, 520KB SRAM, Wi-Fi & Bluetooth)</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>NFC Module:</strong> PN532 or RC522 SPI/I2C reader/writer for ISO/IEC 14443A card emulation</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Display:</strong> 0.96-inch Monochrome SSD1306 I2C OLED (128×64) for transaction approval feedback</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Power Supply:</strong> 3.7V 350mAh Lithium Polymer Battery with TP4056 USB-C charging circuit</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate('/iot-simulator')}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2"
              >
                <Watch className="w-4 h-4" />
                <span>Try the Live IoT Simulator Now</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 text-center bg-gradient-to-b from-slate-950 to-indigo-950/40">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Build the Future of Wearable Payments.
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Experience the complete prototype platform with simulated NFC taps, live neural network anomaly detection, and real-time wallet transactions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              Open User Dashboard
            </button>
            <button
              onClick={() => quickDemoLogin('ADMIN').then(() => navigate('/admin'))}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-colors"
            >
              Open Admin Console
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950 py-10 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-indigo-600 flex items-center justify-center text-white">
                <Watch className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-white text-sm">WristPay AI</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm">
              “Smart payments. Intelligent protection. Right on your wrist.”
            </p>
            <p className="text-[11px] text-slate-600 font-mono">
              College Engineering Prototype · DEMO MODE ONLY
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Product</h5>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-slate-300">Dashboard</button></li>
              <li><button onClick={() => navigate('/wallet')} className="hover:text-slate-300">Wallet</button></li>
              <li><button onClick={() => navigate('/send-money')} className="hover:text-slate-300">Send Money</button></li>
              <li><button onClick={() => navigate('/transactions')} className="hover:text-slate-300">Transactions</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Hardware & AI</h5>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/iot-simulator')} className="hover:text-slate-300">IoT Simulator</button></li>
              <li><button onClick={() => navigate('/ai-security')} className="hover:text-slate-300">DNN Model Metrics</button></li>
              <li><button onClick={() => navigate('/ai-assistant')} className="hover:text-slate-300">AI Assistant</button></li>
              <li><button onClick={() => navigate('/admin/devices')} className="hover:text-slate-300">Device Fleet</button></li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider text-[11px]">Demo Accounts</h5>
            <ul className="space-y-1 font-mono text-[11px]">
              <li className="text-indigo-400 font-medium">User: demo@wristpay.ai</li>
              <li className="text-slate-500">Pass: Demo@12345</li>
              <li className="text-indigo-400 font-medium pt-2">Admin: admin@wristpay.ai</li>
              <li className="text-slate-500">Pass: Admin@12345</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-900 text-center text-slate-600">
          © 2026 WristPay AI Prototype. All rights reserved. Academic software demonstration.
        </div>
      </footer>
    </div>
  );
};
