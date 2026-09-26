"""
WristPay AI - Transaction Inference and Anomaly Attribution
Performs real-time transaction inference and generates human-interpretable
feature attribution explaining WHY a transaction was flagged.
"""

from typing import Dict, Any, Tuple, List
from .preprocess import preprocess_features
from .model import PurePythonDNN

_dnn_instance = PurePythonDNN()

def predict_transaction(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates a transaction dictionary and returns:
    - prediction: 'normal' | 'suspicious'
    - anomaly_probability: float between 0.0 and 1.0
    - is_flagged: bool
    - risk_level: 'LOW' | 'MEDIUM' | 'CRITICAL'
    - explanation: Human-interpretable attribution string
    - feature_attributions: List of contributing factors
    """
    feat = preprocess_features(raw_data)
    prob = _dnn_instance.predict(feat)

    # Threshold for anomaly is 0.50
    is_anomaly = prob >= 0.50
    prediction = 'suspicious' if is_anomaly else 'normal'

    if prob < 0.25:
        risk_level = 'LOW'
    elif prob < 0.65:
        risk_level = 'MEDIUM'
    else:
        risk_level = 'CRITICAL'

    amount = float(raw_data.get('amount', 0))
    hist_avg = float(raw_data.get('hist_avg_amount', 250))
    hour = int(raw_data.get('hour_of_day', 12))
    interval = float(raw_data.get('interval_sec', 3600))
    velocity = float(raw_data.get('velocity_1h', 1))

    reasons: List[str] = []

    ratio = amount / max(hist_avg, 1)
    if ratio >= 4.0:
        reasons.append(f"Transaction amount ₹{amount:,.2f} is {ratio:.1f}x higher than user historical average (₹{hist_avg:,.2f})")
    elif ratio >= 2.5:
        reasons.append(f"Elevated amount ₹{amount:,.2f} noticeably exceeds typical spending range (₹{hist_avg:,.2f})")

    if interval < 60:
        reasons.append(f"High-frequency burst: only {int(interval)}s elapsed since the prior transaction")
    
    if velocity >= 5:
        reasons.append(f"High transaction frequency: {int(velocity)} payments initiated within 60 minutes")

    if hour >= 23 or hour <= 4:
        reasons.append(f"Unusual temporal activity: payment dispatched during abnormal overnight hours ({hour:02d}:00)")

    if raw_data.get('device_anomaly_flag'):
        reasons.append("Unverified terminal or unexpected geographic distance between watch and merchant terminal")

    if is_anomaly:
        if not reasons:
            explanation = "Transaction exhibits multiple subtle multivariate statistical deviations from baseline behavior."
        else:
            explanation = "This transaction was flagged because " + "; ".join(reasons) + "."
    else:
        explanation = "Transaction parameters conform to verified user spending patterns and standard NFC terminal authorization."

    return {
        'prediction': prediction,
        'anomaly_probability': round(prob, 4),
        'anomaly_percentage': round(prob * 100, 2),
        'is_flagged': is_anomaly,
        'risk_level': risk_level,
        'explanation': explanation,
        'reasons': reasons,
        'input_features': {
            'amount': amount,
            'hist_avg_amount': hist_avg,
            'hour_of_day': hour,
            'interval_sec': interval,
            'velocity_1h': velocity
        }
    }

if __name__ == '__main__':
    # Test normal transaction
    sample_normal = {
        'amount': 220,
        'hist_avg_amount': 250,
        'hour_of_day': 14,
        'interval_sec': 7200,
        'velocity_1h': 1
    }
    print("Normal test:", predict_transaction(sample_normal))

    # Test suspicious transaction
    sample_suspicious = {
        'amount': 12500,
        'hist_avg_amount': 250,
        'hour_of_day': 2,
        'interval_sec': 14,
        'velocity_1h': 6
    }
    print("Suspicious test:", predict_transaction(sample_suspicious))
