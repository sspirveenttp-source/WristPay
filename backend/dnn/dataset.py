"""
WristPay AI - Synthetic Transaction Dataset Generator for IoT Wristwatch Payments
Generates simulated contactless smartwatch transactions with realistic normal 
patterns and injected statistical anomalies (spikes, midnight velocities, rapid intervals).
"""

import numpy as np
import pandas as pd
from typing import Tuple

np.random.seed(42)

def generate_synthetic_transactions(n_samples: int = 10000, anomaly_ratio: float = 0.05) -> pd.DataFrame:
    """
    Generates synthetic dataset for training and testing the DNN anomaly detection model.
    
    Features:
    - amount: Transaction amount in INR (₹)
    - hour_of_day: 0 to 23
    - hist_avg_amount: User's historical average amount
    - amount_deviation_z: Z-score deviation from user baseline
    - velocity_1h: Number of transactions within the past hour
    - interval_sec: Seconds since last transaction
    - is_night: 1 if between 23:00 and 05:00, else 0
    - device_anomaly_flag: 1 if untrusted terminal or rapid geo mismatch
    - label: 0 for Normal, 1 for Suspicious (Anomaly)
    """
    n_anomalies = int(n_samples * anomaly_ratio)
    n_normal = n_samples - n_anomalies

    # Normal transactions:
    # Typical campus/retail transactions ₹50 to ₹800, mean ₹250
    normal_hist_avg = np.random.uniform(150, 450, n_normal)
    normal_amounts = np.random.gamma(shape=2.5, scale=normal_hist_avg / 2.5)
    normal_hours = np.random.choice(
        np.arange(24), 
        size=n_normal, 
        p=[0.01, 0.005, 0.005, 0.005, 0.01, 0.02, 0.04, 0.06, 0.08, 0.09, 
           0.10, 0.09, 0.09, 0.08, 0.07, 0.06, 0.06, 0.05, 0.04, 0.03, 
           0.02, 0.015, 0.01, 0.005]
    )
    normal_deviation_z = (normal_amounts - normal_hist_avg) / (normal_hist_avg * 0.45)
    normal_velocity = np.random.poisson(lam=1.2, size=n_normal)
    normal_velocity = np.clip(normal_velocity, 1, 4)
    normal_interval = np.random.exponential(scale=3600, size=n_normal) + 120 # at least 2 minutes
    normal_is_night = ((normal_hours >= 23) | (normal_hours <= 4)).astype(int)
    normal_device_flag = np.random.binomial(n=1, p=0.01, size=n_normal)
    normal_labels = np.zeros(n_normal, dtype=int)

    # Anomaly transactions:
    # 1. Unusually large sums (₹5,000 to ₹25,000)
    # 2. High frequency rapid-fire bursts (velocity 6-15 in 1h, interval < 20s)
    # 3. Midnight sudden high-value transfers
    anomaly_hist_avg = np.random.uniform(150, 450, n_anomalies)
    anomaly_type = np.random.choice(['high_amount', 'rapid_burst', 'night_spike'], size=n_anomalies)
    
    anomaly_amounts = []
    anomaly_hours = []
    anomaly_velocity = []
    anomaly_interval = []
    anomaly_device_flag = []

    for i in range(n_anomalies):
        t = anomaly_type[i]
        base_avg = anomaly_hist_avg[i]
        if t == 'high_amount':
            amt = np.random.uniform(5000, 25000)
            hr = np.random.randint(6, 22)
            vel = np.random.randint(1, 3)
            inter = np.random.uniform(300, 1800)
            dev_flag = np.random.choice([0, 1], p=[0.7, 0.3])
        elif t == 'rapid_burst':
            amt = np.random.uniform(300, 2000)
            hr = np.random.randint(0, 24)
            vel = np.random.randint(5, 12)
            inter = np.random.uniform(5, 45) # seconds apart
            dev_flag = np.random.choice([0, 1], p=[0.5, 0.5])
        else: # night_spike
            amt = np.random.uniform(4000, 15000)
            hr = np.random.choice([0, 1, 2, 3, 4, 23])
            vel = np.random.randint(2, 6)
            inter = np.random.uniform(30, 300)
            dev_flag = np.random.choice([0, 1], p=[0.4, 0.6])
        
        anomaly_amounts.append(amt)
        anomaly_hours.append(hr)
        anomaly_velocity.append(vel)
        anomaly_interval.append(inter)
        anomaly_device_flag.append(dev_flag)

    anomaly_amounts = np.array(anomaly_amounts)
    anomaly_hours = np.array(anomaly_hours)
    anomaly_velocity = np.array(anomaly_velocity)
    anomaly_interval = np.array(anomaly_interval)
    anomaly_device_flag = np.array(anomaly_device_flag)
    anomaly_deviation_z = (anomaly_amounts - anomaly_hist_avg) / (anomaly_hist_avg * 0.45)
    anomaly_is_night = ((anomaly_hours >= 23) | (anomaly_hours <= 4)).astype(int)
    anomaly_labels = np.ones(n_anomalies, dtype=int)

    # Combine datasets
    df_normal = pd.DataFrame({
        'amount': normal_amounts,
        'hour_of_day': normal_hours,
        'hist_avg_amount': normal_hist_avg,
        'amount_deviation_z': normal_deviation_z,
        'velocity_1h': normal_velocity,
        'interval_sec': normal_interval,
        'is_night': normal_is_night,
        'device_anomaly_flag': normal_device_flag,
        'is_anomaly': normal_labels
    })

    df_anomaly = pd.DataFrame({
        'amount': anomaly_amounts,
        'hour_of_day': anomaly_hours,
        'hist_avg_amount': anomaly_hist_avg,
        'amount_deviation_z': anomaly_deviation_z,
        'velocity_1h': anomaly_velocity,
        'interval_sec': anomaly_interval,
        'is_night': anomaly_is_night,
        'device_anomaly_flag': anomaly_device_flag,
        'is_anomaly': anomaly_labels
    })

    df = pd.concat([df_normal, df_anomaly], ignore_index=True)
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)
    return df

if __name__ == '__main__':
    df = generate_synthetic_transactions(10000, 0.05)
    print(f"Generated {len(df)} transactions.")
    print("Normal samples:", (df['is_anomaly'] == 0).sum())
    print("Suspicious samples:", (df['is_anomaly'] == 1).sum())
    print(df.head())
