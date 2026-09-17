from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, Bike, Booking

admin_bp = Blueprint('admin', __name__)

def is_admin(user_id):
    user = User.query.get(user_id)
    return user and user.is_admin

@admin_bp.route('/bookings', methods=['GET'])
@jwt_required()
def get_all_bookings():
    if not is_admin(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403
        
    bookings = Booking.query.order_by(Booking.created_at.desc()).all()
    
    result = []
    for booking in bookings:
        b_dict = booking.to_dict()
        if booking.user:
            b_dict['user_email'] = booking.user.email
            b_dict['user_name'] = booking.user.name
        result.append(b_dict)
        
    return jsonify(result), 200

@admin_bp.route('/bikes/<int:bike_id>', methods=['DELETE'])
@jwt_required()
def delete_bike(bike_id):
    if not is_admin(get_jwt_identity()):
        return jsonify({"error": "Unauthorized"}), 403
        
    bike = Bike.query.get(bike_id)
    if not bike:
        return jsonify({"error": "Bike not found"}), 404
        
    # Check if there are active bookings
    active_bookings = Booking.query.filter_by(bike_id=bike_id).filter(Booking.status != 'Cancelled').first()
    if active_bookings:
        return jsonify({"error": "Cannot delete bike with active bookings"}), 400
        
    db.session.delete(bike)
    db.session.commit()
    
    return jsonify({"message": "Bike deleted successfully"}), 200
