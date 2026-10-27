"""
RideX Machine Learning Engine
Trains and serializes:
1. Dynamic Rental Price Prediction Model (Random Forest Regressor)
2. Demand & Surge Pricing Estimator
"""

import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

MODEL_DIR = os.path.dirname(os.path.abspath(__file__))
PRICE_MODEL_PATH = os.path.join(MODEL_DIR, "price_model.pkl")

def generate_training_data(n_samples=2500):
    np.random.seed(42)
    bike_types = ['Sport', 'Cruiser', 'Scooter', 'Commuter', 'Naked', 'Classic']
    types = np.random.choice(bike_types, size=n_samples)
    
    # Base price mapping approx per hour
    base_map = {
        'Sport': (35, 55),
        'Cruiser': (30, 50),
        'Scooter': (10, 18),
        'Commuter': (12, 22),
        'Naked': (20, 35),
        'Classic': (25, 40)
    }
    
    base_prices = np.array([np.random.uniform(base_map[t][0], base_map[t][1]) for t in types])
    duration_hours = np.random.exponential(scale=6, size=n_samples) + 1  # 1 to ~48 hours
    duration_hours = np.clip(duration_hours, 1, 72)
    
    day_of_week = np.random.randint(0, 7, size=n_samples) # 0=Mon, 6=Sun
    pickup_hour = np.random.randint(6, 23, size=n_samples) # 6am to 11pm
    
    # Demand multiplier based on weekend & peak hours
    is_weekend = (day_of_week >= 5).astype(int)
    is_peak_hour = (((pickup_hour >= 8) & (pickup_hour <= 11)) | ((pickup_hour >= 17) & (pickup_hour <= 21))).astype(int)
    
    # Calculate realistic target total price with dynamic market adjustments
    # Base cost = duration * base_price
    # Multi-hour discount: longer rentals get slight discount
    duration_discount = np.where(duration_hours > 24, 0.82, np.where(duration_hours > 12, 0.90, 1.0))
    
    # Weekend surge (+15% to +25%)
    weekend_surge = np.where(is_weekend == 1, 1.18, 1.0)
    
    # Peak hour surge (+8%)
    peak_surge = np.where(is_peak_hour == 1, 1.08, 1.0)
    
    # High demand randomness
    noise = np.random.normal(1.0, 0.04, size=n_samples)
    
    target_price = (duration_hours * base_prices) * duration_discount * weekend_surge * peak_surge * noise
    target_price = np.round(target_price, 2)
    
    # Features matrix
    # [bike_type, base_price_per_hour, duration_hours, day_of_week, pickup_hour, is_weekend]
    X_data = []
    for i in range(n_samples):
        X_data.append([
            types[i],
            float(base_prices[i]),
            float(duration_hours[i]),
            int(day_of_week[i]),
            int(pickup_hour[i]),
            int(is_weekend[i])
        ])
        
    return X_data, target_price

def train_and_save_model():
    print("Generating training dataset for RideX Pricing Model...")
    X, y = generate_training_data()
    
    # Pipeline setup
    categorical_features = [0] # bike_type
    numeric_features = [1, 2, 3, 4, 5]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numeric_features)
        ]
    )
    
    model = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)
    
    print("Fitting Random Forest Model...")
    model.fit(X_train, y_train)
    
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    print(f"Model Training R²: {train_score:.4f}, Test R²: {test_score:.4f}")
    
    joblib.dump(model, PRICE_MODEL_PATH)
    try:
        print("Model saved successfully.")
    except Exception:
        pass
    return model

if __name__ == "__main__":
    train_and_save_model()
