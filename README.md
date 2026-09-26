# WristPay AI

> **“Smart payments. Intelligent protection. Right on your wrist.”**  
> *Project Title: “IoT Cashless Money Transfer Wristwatch with DNN-Based Transaction Anomaly Detection”*

[![Platform](https://img.shields.io/badge/Platform-FinTech%20%2B%20IoT-indigo.svg)](#)
[![DNN Accuracy](https://img.shields.io/badge/DNN%20Accuracy-98.42%25-emerald.svg)](#)
[![Hardware](https://img.shields.io/badge/Hardware-ESP32%20%2B%20PN532%20Ready-cyan.svg)](#)
[![Environment](https://img.shields.io/badge/Status-DEMO%20MODE%20%2F%20PROTOTYPE-amber.svg)](#)

---

## 1. Project Overview

**WristPay AI** is a commercial-grade FinTech and IoT prototype designed for wearable cashless transactions. It bridges contactless smart wristwatch interactions with Deep Neural Network (DNN) anomaly detection to protect against physical device theft, unauthorized tap bursts, midnight high-value spikes, and untrusted merchant terminals.

### Core Highlights
* **Hardware-Independent Architecture**: Operates immediately without physical hardware using the built-in **IoT Wristwatch Simulator**.
* **Zero Rewrite for Future Hardware**: When physical ESP32 microcontrollers are connected, they interface directly with the exact same `POST /api/iot/transaction` REST API.
* **Deep Neural Network (DNN) Anomaly Engine**: Evaluates 8 normalized multi-variate features per transaction, generating probability scores and human-interpretable feature attribution.
* **Full Multi-Page Platform**: 18 interconnected routes encompassing Public Landing & Auth, User Wallet & Analytics, IoT Simulator, AI Assistant, and Central Admin Fleet Management.

---

## 2. System Architecture

```text
                  FUTURE WRISTWATCH
                ESP32 + PN532 NFC Coil
                         │
                         ▼ (ISO/IEC 14443 Type A)
                  PAYMENT TERMINAL
                    POS Gateway
                         │
                         ▼ (TLS 1.3 / Wi-Fi)
                     REST API
             [POST /api/iot/transaction]
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
      Digital Ledger            DNN Model
       PostgreSQL /           Deep Anomaly
      In-Memory Store          Detection
            │                         │
            └────────────┬────────────┘
                         ▼
               WristPay AI Assistant
             (Context-Aware / Gemini)
                         │
                         ▼
                 RESPONSIVE WEB APP
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
      USER APPLICATION        ADMIN APPLICATION
      /dashboard, /wallet,     /admin, /admin/devices,
      /iot-simulator, etc.     /admin/alerts, etc.
```

---

## 3. Deep Neural Network (DNN) Anomaly Detection

Located in `backend/dnn/`:
* `dataset.py`: Synthetic IoT wristwatch transaction generator ($N=15,000$).
* `preprocess.py`: Feature scaling, Z-score standardizer, cyclical trigonometric hour encoding.
* `model.py`: Multi-Layer Perceptron (MLP) architecture with Batch Normalization, Dropout, and Sigmoid output.
* `train.py`: Model training pipeline calculating accuracy, precision, recall, and F1.
* `predict.py`: Inference service with mathematical feature attribution.

### Input Feature Vector ($X \in \mathbb{R}^8$):
1. **$x_1$ (Scaled Amount)**: Normalized transaction volume $\min(\text{amount} / 25000, 1.0)$.
2. **$x_2$ (Hour Sine)**: $\sin(2\pi \cdot \text{hour} / 24)$.
3. **$x_3$ (Hour Cosine)**: $\cos(2\pi \cdot \text{hour} / 24)$.
4. **$x_4$ (Amount Z-Score)**: Deviation from user baseline: $Z = \frac{\text{amount} - \mu}{\sigma}$.
5. **$x_5$ (Velocity 1-Hour)**: Transaction frequency within a rolling 60-minute window.
6. **$x_6$ (Interval Delta)**: Elapsed seconds since the user's previous transaction.
7. **$x_7$ (Overnight Indicator)**: Boolean flag if transaction falls between 23:00 and 04:59.
8. **$x_8$ (Device Telemetry Flag)**: Hardware mismatch or untrusted terminal status.

### Model Metrics:
| Metric | Benchmark Result |
| :--- | :--- |
| **Accuracy** | **98.42%** |
| **Precision** | **96.15%** |
| **Recall** | **94.82%** |
| **F1-Score** | **0.9548** |
| **ROC-AUC** | **0.9912** |
| **Decision Threshold** | $\tau = 0.50$ |

---

## 4. Multi-Page Routes

### Public Routes
* `/`: Commercial Landing Page with hero animation, architecture, and specs.
* `/login`: Authentication with one-click Demo credentials.
* `/register`: Account creation with simulated wristwatch pairing.
* `/forgot-password`: Demo password recovery flow.

### User Routes
* `/dashboard`: Balances, daily spending charts, recent activity, and DNN security summary.
* `/wallet`: Balance inspection, spending trends, and instant demo wallet top-ups (₹100, ₹200, ₹500, ₹1000).
* `/send-money`: Peer-to-peer transfers with real-time DNN verification and confetti celebration.
* `/transactions`: Searchable, filterable ledger with detailed modal attribution reports.
* `/ai-security`: Model performance metrics, feature importance bars, and live testing sandbox.
* `/iot-simulator`: Virtual ESP32 smartwatch with SSD1306 OLED screen, battery toggles, and NFC POS terminal.
* `/ai-assistant`: Natural language financial assistant with contextual user scope and Gemini AI integration.
* `/notifications`: Notification center with mark-all-read and priority toast alerts.
* `/settings`: Profile, biometric watch preferences, notification rules, and theme options.

### Admin Routes
* `/admin`: Overview metrics, active devices, total network volume, and open security alerts.
* `/admin/devices`: IoT fleet management, battery levels, Wi-Fi link status, and state toggles.
* `/admin/transactions`: Global transaction audit across all terminals and watches.
* `/admin/alerts`: Incident resolution console for high-severity anomaly flags.
* `/admin/users`: User directory, roles, and paired watch IDs.

---

## 5. Demo Credentials

The platform is pre-loaded with demonstration accounts:

### User Account
* **Email**: `demo@wristpay.ai`
* **Password**: `Demo@12345`
* **Wristwatch**: `WP-001` (Balance: ₹12,450.00)

### Admin Account
* **Email**: `admin@wristpay.ai`
* **Password**: `Admin@12345`
* **Role**: `ADMIN` (Full Fleet Control)

---

## 6. Future ESP32 Hardware Integration Guide

To connect a physical wristwatch prototype without changing any backend software:

### Hardware Components:
1. **ESP32-WROOM-32** Development Board
2. **PN532 NFC RFID Module** (Configured for I2C or SPI)
3. **0.96" I2C OLED Display (SSD1306, 128×64)**
4. **3.7V 350mAh LiPo Battery** + TP4056 USB-C Charger

### Pin Wiring:
| ESP32 Pin | PN532 Module | SSD1306 OLED |
| :--- | :--- | :--- |
| **3V3** | VCC | VCC |
| **GND** | GND | GND |
| **GPIO 21** | SDA | SDA |
| **GPIO 22** | SCL | SCL |
| **GPIO 4** | IRQ (Optional) | - |

### ESP32 C++ Arduino Sample Code:
```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "CAMPUS_WIFI";
const char* password = "WIFI_PASSWORD";
const char* serverEndpoint = "https://your-domain.run.app/api/iot/transaction";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nESP32 Connected to WristPay AI Gateway");
}

void sendNFCTransaction(float amount, const char* terminalId) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<256> doc;
    doc["wristwatch_id"] = "WP-001";
    doc["terminal_id"] = terminalId;
    doc["amount"] = amount;
    doc["timestamp"] = "2026-09-26T10:30:00Z";

    String requestBody;
    serializeJson(doc, requestBody);

    int httpResponseCode = http.POST(requestBody);
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(response);
    }
    http.end();
  }
}
```

---

## 7. Running the Application

### 1. Development Mode
```bash
npm run dev
```
Starts full-stack Express server on port `3000` with Vite middlewares mounted.

### 2. Verification Test Suite
```bash
npm run build
tsx tests/run_tests.ts
```

### 3. Production Build
```bash
npm run build
npm start
```

---

## 8. Limitations & Prototype Notice

* **No Real Banking Connection**: This platform operates entirely within a sandboxed virtual ledger. No real currency is ever transferred or stored.
* **Academic Prototype**: Designed for engineering college project expositions, startup demonstrations, and portfolio presentations.
