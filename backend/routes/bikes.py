import os
from werkzeug.utils import secure_filename
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Bike, Review, Booking, User

bikes_bp = Blueprint('bikes', __name__)

# Absolute path to the backend uploads folder
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), '../uploads/bikes'))

@bikes_bp.route('/', methods=['GET'])
def get_bikes():
    bikes = Bike.query.all()
    bike_list = []
    for bike in bikes:
        b_dict = bike.to_dict()
        b_dict['average_rating'] = sum([r.rating for r in bike.reviews]) / len(bike.reviews) if bike.reviews else 0
        bike_list.append(b_dict)
    return jsonify(bike_list), 200

@bikes_bp.route('/<int:bike_id>', methods=['GET'])
def get_bike(bike_id):
    bike = Bike.query.get(bike_id)
    if not bike:
        return jsonify({"error": "Bike not found"}), 404
        
    b_dict = bike.to_dict()
    b_dict['reviews'] = [r.to_dict() for r in bike.reviews]
    b_dict['average_rating'] = sum([r.rating for r in bike.reviews]) / len(bike.reviews) if bike.reviews else 0
    return jsonify(b_dict), 200

@bikes_bp.route('/<int:bike_id>/reviews', methods=['POST'])
@jwt_required()
def add_review(bike_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    bike = Bike.query.get(bike_id)
    if not bike:
        return jsonify({"error": "Bike not found"}), 404
        
    if not data or not data.get('rating'):
        return jsonify({"error": "Rating is required"}), 400
        
    has_booked = Booking.query.filter_by(user_id=user_id, bike_id=bike_id).first()
    if not has_booked:
        return jsonify({"error": "You can only review bikes you have rented"}), 403
        
    new_review = Review(
        user_id=user_id,
        bike_id=bike_id,
        rating=int(data['rating']),
        comment=data.get('comment', '')
    )
    
    db.session.add(new_review)
    db.session.commit()
    
    return jsonify({"message": "Review added successfully", "review": new_review.to_dict()}), 201

@bikes_bp.route('/', methods=['POST'])
@jwt_required()
def add_bike():
    # Verify Admin
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    # Check if request is multipart/form-data
    if 'multipart/form-data' not in request.content_type:
        return jsonify({"error": "Content-Type must be multipart/form-data"}), 400

    name = request.form.get('name')
    brand = request.form.get('brand')
    type = request.form.get('type')
    price_per_hour = request.form.get('price_per_hour')
    
    if not name or not brand or not type or not price_per_hour:
        return jsonify({"error": "Missing required fields"}), 400
        
    image_url = '🏍️' # Default emoji
    
    if 'image' in request.files:
        file = request.files['image']
        if file and file.filename != '':
            filename = secure_filename(file.filename)
            # Ensure directory exists
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            filepath = os.path.join(UPLOAD_FOLDER, filename)
            file.save(filepath)
            image_url = f"/uploads/bikes/{filename}"
        
    new_bike = Bike(
        name=name,
        brand=brand,
        type=type,
        price_per_hour=float(price_per_hour),
        image_url=image_url
    )
    
    db.session.add(new_bike)
    db.session.commit()
    
    return jsonify({"message": "Bike added successfully", "bike": new_bike.to_dict()}), 201
