from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from models import db, Booking, Bike, User, Station

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('/', methods=['POST'])
@jwt_required()
def create_booking():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Enforce KYC verification
    if user.kyc_status != 'Verified':
        return jsonify({
            "error": "Driving License (KYC) verification required to rent a bike. Please submit your Driving License in Profile / Verification.",
            "requires_kyc": True,
            "current_status": user.kyc_status or "Unverified"
        }), 403

    data = request.get_json()
    if not data or not data.get('bike_id') or not data.get('start_time') or not data.get('end_time'):
        return jsonify({"error": "Missing required fields"}), 400
        
    bike = Bike.query.get(data['bike_id'])
    if not bike:
        return jsonify({"error": "Bike not found"}), 404
        
    if not bike.is_available:
        return jsonify({"error": "Bike is currently not available"}), 400
        
    try:
        # Expected format: "2026-10-28T10:00:00"
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', ''))
        end_time = datetime.fromisoformat(data['end_time'].replace('Z', ''))
    except ValueError:
        return jsonify({"error": "Invalid date format. Use ISO format."}), 400
        
    duration_hours = (end_time - start_time).total_seconds() / 3600
    if duration_hours <= 0:
        return jsonify({"error": "End time must be after start time"}), 400
        
    # Check for overlapping bookings
    overlapping = Booking.query.filter(
        Booking.bike_id == bike.id,
        Booking.status != 'Cancelled',
        Booking.start_time < end_time,
        Booking.end_time > start_time
    ).first()
    
    if overlapping:
        return jsonify({"error": "Bike is already booked for the selected dates/hours"}), 409
        
    # Total price can be client-passed dynamic price or calculated
    if data.get('total_price') and float(data.get('total_price')) > 0:
        total_price = float(data.get('total_price'))
    else:
        total_price = round(duration_hours * bike.price_per_hour, 2)
    
    pickup_station_id = data.get('pickup_station_id')
    dropoff_station_id = data.get('dropoff_station_id') or pickup_station_id

    new_booking = Booking(
        user_id=user_id,
        bike_id=bike.id,
        start_time=start_time,
        end_time=end_time,
        total_price=total_price,
        pickup_station_id=pickup_station_id,
        dropoff_station_id=dropoff_station_id,
        payment_method=data.get('payment_method', 'Razorpay'),
        payment_id=data.get('payment_id', 'pay_default')
    )
    
    db.session.add(new_booking)
    db.session.commit()
    
    return jsonify({
        "message": "Booking created successfully", 
        "booking": new_booking.to_dict()
    }), 201

@bookings_bp.route('/', methods=['GET'])
@jwt_required()
def get_user_bookings():
    user_id = get_jwt_identity()
    bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.start_time.desc()).all()
    return jsonify([booking.to_dict() for booking in bookings]), 200

@bookings_bp.route('/<int:booking_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_booking(booking_id):
    user_id = get_jwt_identity()
    booking = Booking.query.get(booking_id)
    
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
        
    if str(booking.user_id) != str(user_id):
        return jsonify({"error": "Unauthorized"}), 403
        
    if booking.status == 'Cancelled':
        return jsonify({"error": "Booking is already cancelled"}), 400
        
    if booking.start_time < datetime.utcnow():
        return jsonify({"error": "Cannot cancel past or ongoing bookings"}), 400
        
    booking.status = 'Cancelled'
    db.session.commit()
    
    return jsonify({"message": "Booking cancelled successfully", "booking": booking.to_dict()}), 200
