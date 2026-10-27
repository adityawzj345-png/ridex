from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Station(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(50), nullable=False)
    address = db.Column(db.String(250), nullable=False)
    contact_number = db.Column(db.String(20), nullable=True)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    is_active = db.Column(db.Boolean, default=True)

    bikes = db.relationship('Bike', backref='station', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "city": self.city,
            "address": self.address,
            "contact_number": self.contact_number,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "is_active": self.is_active,
            "available_bikes_count": len([b for b in self.bikes if b.is_available])
        }

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    is_admin = db.Column(db.Boolean, default=False)
    
    # KYC / License Verification fields
    license_number = db.Column(db.String(50), nullable=True)
    license_image_url = db.Column(db.String(500), nullable=True)
    kyc_status = db.Column(db.String(20), default="Unverified")  # Unverified, Pending, Verified, Rejected
    kyc_rejected_reason = db.Column(db.String(200), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    bookings = db.relationship('Booking', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "is_admin": self.is_admin,
            "license_number": self.license_number,
            "license_image_url": self.license_image_url,
            "kyc_status": self.kyc_status or "Unverified",
            "kyc_rejected_reason": self.kyc_rejected_reason,
            "created_at": self.created_at.isoformat()
        }

class Bike(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    brand = db.Column(db.String(50), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    price_per_hour = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(500), nullable=True)
    
    # Station location
    station_id = db.Column(db.Integer, db.ForeignKey('station.id'), nullable=True)
    
    bookings = db.relationship('Booking', backref='bike', lazy=True)
    reviews = db.relationship('Review', backref='bike', lazy=True)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand": self.brand,
            "type": self.type,
            "price_per_hour": self.price_per_hour,
            "is_available": self.is_available,
            "image_url": self.image_url,
            "station_id": self.station_id,
            "station_name": self.station.name if self.station else "Central Station",
            "station_city": self.station.city if self.station else "Metro Hub"
        }

class Booking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bike_id = db.Column(db.Integer, db.ForeignKey('bike.id'), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)
    total_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="Confirmed") # Confirmed, Completed, Cancelled
    
    # Pickup / Drop-off Custom Locations & Station References
    pickup_station_id = db.Column(db.Integer, db.ForeignKey('station.id'), nullable=True)
    dropoff_station_id = db.Column(db.Integer, db.ForeignKey('station.id'), nullable=True)
    pickup_location = db.Column(db.String(250), nullable=True)
    dropoff_location = db.Column(db.String(250), nullable=True)

    # WhatsApp Notifications
    whatsapp_number = db.Column(db.String(30), nullable=True)
    whatsapp_status = db.Column(db.String(30), default="Pending") # Sent, Simulated, Failed
    
    # Payment details
    payment_method = db.Column(db.String(50), default="Razorpay")
    payment_id = db.Column(db.String(100), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    pickup_station = db.relationship('Station', foreign_keys=[pickup_station_id])
    dropoff_station = db.relationship('Station', foreign_keys=[dropoff_station_id])

    def to_dict(self):
        p_name = self.pickup_location or (self.pickup_station.name if self.pickup_station else "Central Station")
        d_name = self.dropoff_location or (self.dropoff_station.name if self.dropoff_station else p_name)
        return {
            "id": self.id,
            "user_id": self.user_id,
            "bike_id": self.bike_id,
            "bike_name": self.bike.name if self.bike else None,
            "bike_brand": self.bike.brand if self.bike else None,
            "bike_image": self.bike.image_url if self.bike else None,
            "start_time": self.start_time.isoformat(),
            "end_time": self.end_time.isoformat(),
            "total_price": self.total_price,
            "status": self.status,
            "pickup_station_id": self.pickup_station_id,
            "pickup_station_name": self.pickup_station.name if self.pickup_station else "Central Station",
            "dropoff_station_id": self.dropoff_station_id,
            "dropoff_station_name": self.dropoff_station.name if self.dropoff_station else "Central Station",
            "pickup_location": p_name,
            "dropoff_location": d_name,
            "whatsapp_number": self.whatsapp_number,
            "whatsapp_status": self.whatsapp_status,
            "payment_method": self.payment_method or "Online",
            "payment_id": self.payment_id,
            "created_at": self.created_at.isoformat()
        }

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    bike_id = db.Column(db.Integer, db.ForeignKey('bike.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "bike_id": self.bike_id,
            "rating": self.rating,
            "comment": self.comment,
            "created_at": self.created_at.isoformat(),
            "user_name": self.user.name if self.user else "Anonymous"
        }
