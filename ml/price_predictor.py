import os
import joblib
from datetime import datetime

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
PRICE_MODEL_PATH = os.path.join(MODEL_DIR, "price_model.pkl")

_model = None

def get_model():
    global _model
    if _model is None:
        if os.path.exists(PRICE_MODEL_PATH):
            _model = joblib.load(PRICE_MODEL_PATH)
        else:
            from ml.train_models import train_and_save_model
            _model = train_and_save_model()
    return _model

def predict_rental_price(bike_type, base_price_per_hour, start_time_iso, end_time_iso):
    """
    Predicts optimal dynamic rental price using Random Forest ML Model.
    Returns:
    - predicted_price: float
    - standard_price: float
    - surge_factor: float
    - surge_tag: str ("Discounted", "Standard", "Peak Weekend", "High Demand")
    - recommendation: str
    """
    try:
        start_dt = datetime.fromisoformat(start_time_iso.replace('Z', ''))
        end_dt = datetime.fromisoformat(end_time_iso.replace('Z', ''))
    except Exception:
        start_dt = datetime.utcnow()
        end_dt = start_dt

    duration_hours = max(1.0, (end_dt - start_dt).total_seconds() / 3600.0)
    day_of_week = start_dt.weekday()
    pickup_hour = start_dt.hour
    is_weekend = 1 if day_of_week >= 5 else 0

    model = get_model()
    features = [[bike_type, float(base_price_per_hour), float(duration_hours), int(day_of_week), int(pickup_hour), int(is_weekend)]]
    
    pred_val = float(model.predict(features)[0])
    standard_price = round(float(duration_hours * base_price_per_hour), 2)
    predicted_price = round(max(standard_price * 0.75, pred_val), 2)

    ratio = predicted_price / standard_price if standard_price > 0 else 1.0

    if ratio < 0.95:
        surge_tag = "Saver Deal (Duration Discount)"
        recommendation = f"Great deal! You save ₹{round(standard_price - predicted_price, 2)} with dynamic duration discount."
    elif ratio > 1.15:
        surge_tag = "High Demand (Weekend Surge)"
        recommendation = "Weekend high demand active. Book weekdays to save up to 20%."
    elif ratio > 1.05:
        surge_tag = "Peak Hours"
        recommendation = "Peak booking hour. Slots are filling fast."
    else:
        surge_tag = "Standard Fair Price"
        recommendation = "Standard fair market pricing applied."

    return {
        "standard_price": standard_price,
        "predicted_price": predicted_price,
        "duration_hours": round(duration_hours, 1),
        "surge_tag": surge_tag,
        "surge_factor": round(ratio, 2),
        "recommendation": recommendation,
        "is_weekend": bool(is_weekend)
    }
