from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Station, User, Bike

stations_bp = Blueprint('stations', __name__)

@stations_bp.route('/', methods=['GET'])
def get_stations():
    city = request.args.get('city')
    if city:
        stations = Station.query.filter_by(city=city, is_active=True).all()
    else:
        stations = Station.query.filter_by(is_active=True).all()
    return jsonify([s.to_dict() for s in stations]), 200

@stations_bp.route('/<int:station_id>', methods=['GET'])
def get_station(station_id):
    station = Station.query.get(station_id)
    if not station:
        return jsonify({"error": "Station not found"}), 404
    data = station.to_dict()
    data['bikes'] = [b.to_dict() for b in station.bikes if b.is_available]
    return jsonify(data), 200

@stations_bp.route('/', methods=['POST'])
@jwt_required()
def add_station():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Unauthorized. Admin privileges required."}), 403

    data = request.get_json()
    if not data or not data.get('name') or not data.get('city') or not data.get('address'):
        return jsonify({"error": "Name, city, and address are required"}), 400

    new_station = Station(
        name=data['name'],
        city=data['city'],
        address=data['address'],
        contact_number=data.get('contact_number', ''),
        latitude=float(data.get('latitude', 0.0)) if data.get('latitude') else None,
        longitude=float(data.get('longitude', 0.0)) if data.get('longitude') else None,
        is_active=True
    )
    db.session.add(new_station)
    db.session.commit()

    return jsonify({"message": "Station added successfully", "station": new_station.to_dict()}), 201

@stations_bp.route('/<int:station_id>', methods=['DELETE'])
@jwt_required()
def delete_station(station_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    station = Station.query.get(station_id)
    if not station:
        return jsonify({"error": "Station not found"}), 404

    station.is_active = False
    db.session.commit()
    return jsonify({"message": "Station deactivated successfully"}), 200
