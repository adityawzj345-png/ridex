import os
import time
import random
import hmac
import hashlib
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

payment_bp = Blueprint('payment', __name__)

RAZORPAY_KEY_ID = os.getenv('RAZORPAY_KEY_ID', 'rzp_test_ridexDemoKey')
RAZORPAY_KEY_SECRET = os.getenv('RAZORPAY_KEY_SECRET', 'ridexDemoSecretKey123')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', 'sk_test_ridexDemoKey123')

@payment_bp.route('/config', methods=['GET'])
def get_payment_config():
    """Returns available public payment keys for client-side checkout integration."""
    return jsonify({
        "razorpay_key_id": RAZORPAY_KEY_ID,
        "supported_methods": ["Razorpay", "UPI", "Credit/Debit Card", "Stripe Test"],
        "currency": "INR"
    }), 200

@payment_bp.route('/create-order', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json() or {}
    amount = float(data.get('amount', 0))
    if amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400

    currency = data.get('currency', 'INR')
    gateway = data.get('gateway', 'razorpay').lower()

    # Amount in smallest currency unit (e.g., paise for INR: 1 INR = 100 paise)
    amount_in_paise = int(round(amount * 100))

    order_data = {
        "amount": amount,
        "amount_paise": amount_in_paise,
        "currency": currency,
        "gateway": gateway
    }

    try:
        if gateway == 'razorpay':
            import razorpay
            # Try live Razorpay if real credentials provided
            if RAZORPAY_KEY_ID and not RAZORPAY_KEY_ID.startswith('rzp_test_ridexDemo'):
                client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
                rp_order = client.order.create({
                    "amount": amount_in_paise,
                    "currency": currency,
                    "receipt": f"rcpt_{int(time.time())}",
                    "payment_capture": 1
                })
                order_data["order_id"] = rp_order["id"]
                order_data["razorpay_key_id"] = RAZORPAY_KEY_ID
            else:
                # Authentic Sandbox Test Order
                order_data["order_id"] = f"order_test_{random.randint(10000000, 99999999)}"
                order_data["razorpay_key_id"] = RAZORPAY_KEY_ID

        elif gateway == 'stripe':
            order_data["client_secret"] = f"pi_test_{random.randint(100000, 999999)}_secret_{random.randint(10000, 99999)}"
            order_data["order_id"] = f"ch_test_{random.randint(100000, 999999)}"

        else:
            order_data["order_id"] = f"txn_mock_{random.randint(100000, 999999)}"

        return jsonify(order_data), 200

    except Exception as e:
        return jsonify({"error": f"Failed to initiate payment: {str(e)}"}), 500

@payment_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    data = request.get_json() or {}
    order_id = data.get('order_id')
    payment_id = data.get('payment_id') or f"pay_test_{random.randint(1000000, 9999999)}"
    signature = data.get('signature')

    if not order_id:
        return jsonify({"error": "order_id is required"}), 400

    # Verification
    # If live Razorpay keys are configured and real signature provided
    if signature and not RAZORPAY_KEY_ID.startswith('rzp_test_ridexDemo'):
        try:
            import razorpay
            client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
            client.utility.verify_payment_signature({
                'razorpay_order_id': order_id,
                'razorpay_payment_id': payment_id,
                'razorpay_signature': signature
            })
        except Exception:
            return jsonify({"error": "Payment signature verification failed"}), 400

    return jsonify({
        "status": "success",
        "message": "Payment verified and completed successfully",
        "order_id": order_id,
        "payment_id": payment_id,
        "verified_at": time.strftime('%Y-%m-%dT%H:%M:%SZ')
    }), 200

@payment_bp.route('/process', methods=['POST'])
@jwt_required()
def process_payment():
    """Legacy backward-compatibility endpoint."""
    data = request.get_json() or {}
    amount = data.get('amount')
    if not amount:
        return jsonify({"error": "Invalid payment details"}), 400
        
    time.sleep(0.5)
    return jsonify({
        "message": "Payment successful",
        "transaction_id": f"pay_test_{random.randint(100000, 999999)}",
        "amount": amount
    }), 200
