from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import time
import random

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process', methods=['POST'])
@jwt_required()
def process_payment():
    data = request.get_json()
    
    if not data or not data.get('amount') or not data.get('card_number'):
        return jsonify({"error": "Invalid payment details"}), 400
        
    # Simulate network delay for payment processing
    time.sleep(1.5)
    
    # Success
    return jsonify({
        "message": "Payment successful",
        "transaction_id": f"txn_{random.randint(100000, 999999)}",
        "amount": data['amount']
    }), 200
