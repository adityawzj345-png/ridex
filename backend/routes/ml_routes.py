import sys
import os

# Add root folder to sys.path so ml module can be imported cleanly
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if ROOT_DIR not in sys.path:
    sys.path.append(ROOT_DIR)

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Bike, Booking, User
from ml.price_predictor import predict_rental_price
from ml.recommender import get_recommendations

ml_bp = Blueprint('ml', __name__)

@ml_bp.route('/predict-price', methods=['POST'])
def predict_price_route():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing payload"}), 400

    bike_type = data.get('bike_type', 'Sport')
    base_price = float(data.get('price_per_hour', 25.0))
    start_time = data.get('start_time')
    end_time = data.get('end_time')

    if not start_time or not end_time:
        return jsonify({"error": "start_time and end_time are required"}), 400

    result = predict_rental_price(bike_type, base_price, start_time, end_time)
    return jsonify(result), 200

@ml_bp.route('/recommendations', methods=['GET'])
@jwt_required(optional=True)
def recommendations_route():
    user_id = get_jwt_identity()
    user_bookings = []
    if user_id:
        bookings = Booking.query.filter_by(user_id=user_id).all()
        user_bookings = [b.to_dict() for b in bookings]

    bikes = Bike.query.filter_by(is_available=True).all()
    bike_list = []
    for b in bikes:
        d = b.to_dict()
        d['average_rating'] = sum([r.rating for r in b.reviews]) / len(b.reviews) if b.reviews else 4.5
        bike_list.append(d)

    top_recs = get_recommendations(user_bookings, bike_list, top_k=4)
    return jsonify({
        "recommendations": top_recs,
        "is_personalized": bool(user_id and len(user_bookings) > 0)
    }), 200
