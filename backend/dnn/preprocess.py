"""
WristPay AI - Feature Preprocessing Pipeline
Standardizes feature scales, extracts cyclical hour encodings, and maps raw transaction metadata
into normalized tensor inputs for the Deep Neural Network.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List

FEATURE_NAMES = [
    'amount_scaled',
    'hour_sin',
    'hour_cos',
    'amount_deviation_z',
    'velocity_1h_scaled',
    'interval_scaled',
    'is_night',
    'device_anomaly_flag'
]

# Scaler constants computed from baseline training distribution
AMOUNT_SCALE_MAX = 25000.0
VELOCITY_SCALE_MAX = 15.0
INTERVAL_SCALE_MAX = 7200.0

def preprocess_features(raw: Dict[str, Any]) -> np.ndarray:
    """
    Transforms a single raw transaction dictionary into an 8-dimensional normalized feature vector.
    """
    amount = float(raw.get('amount', 0.0))
    hour = int(raw.get('hour_of_day', 12))
    hist_avg = float(raw.get('hist_avg_amount', 250.0))
    velocity = float(raw.get('velocity_1h', 1.0))
    interval = float(raw.get('interval_sec', 3600.0))
    is_night = float(raw.get('is_night', 1 if (hour >= 23 or hour <= 4) else 0))
    device_flag = float(raw.get('device_anomaly_flag', 0))

    # 1. Scaled amount (clipped)
    amount_scaled = np.clip(amount / AMOUNT_SCALE_MAX, 0.0, 1.0)

    # 2. Cyclical hour of day encoding
    hour_rad = 2.0 * np.pi * (hour / 24.0)
    hour_sin = np.sin(hour_rad)
    hour_cos = np.cos(hour_rad)

    # 3. Z-score deviation from user baseline
    std_estimate = max(hist_avg * 0.45, 20.0)
    amount_dev_z = (amount - hist_avg) / std_estimate
    amount_dev_z_norm = np.clip(amount_dev_z / 10.0, -1.0, 3.0)

    # 4. Scaled velocity & interval
    velocity_scaled = np.clip(velocity / VELOCITY_SCALE_MAX, 0.0, 1.0)
    interval_scaled = np.clip(interval / INTERVAL_SCALE_MAX, 0.0, 1.0)

    features = np.array([
        amount_scaled,
        hour_sin,
        hour_cos,
        amount_dev_z_norm,
        velocity_scaled,
        interval_scaled,
        is_night,
        device_flag
    ], dtype=np.float32)

    return features

def preprocess_dataframe(df: pd.DataFrame) -> Tuple_Array:
    """
    Preprocesses full DataFrame for training.
    """
    X = []
    for _, row in df.iterrows():
        X.append(preprocess_features(row.to_dict()))
    X = np.array(X, dtype=np.float32)
    y = df['is_anomaly'].values.astype(np.float32)
    return X, y
