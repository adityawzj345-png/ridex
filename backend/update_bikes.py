from app import app, db
from models import Bike, Booking

common_bikes = [
    { "name": "Classic 350", "brand": "Royal Enfield", "type": "Cruiser", "price_per_hour": 30, "image_url": "🏍️" },
    { "name": "Pulsar 150", "brand": "Bajaj", "type": "Commuter", "price_per_hour": 15, "image_url": "🏍️" },
    { "name": "Splendor Plus", "brand": "Hero", "type": "Commuter", "price_per_hour": 10, "image_url": "🏍️" },
    { "name": "Activa 6G", "brand": "Honda", "type": "Scooter", "price_per_hour": 12, "image_url": "🛵" },
    { "name": "Apache RTR 160", "brand": "TVS", "type": "Sport", "price_per_hour": 18, "image_url": "🏍️" },
    { "name": "FZ-S V3", "brand": "Yamaha", "type": "Sport", "price_per_hour": 20, "image_url": "🏍️" },
    { "name": "Duke 200", "brand": "KTM", "type": "Naked", "price_per_hour": 25, "image_url": "🏍️" },
    { "name": "Jupiter 125", "brand": "TVS", "type": "Scooter", "price_per_hour": 13, "image_url": "🛵" }
]

def update_database():
    with app.app_context():
        # Clear existing bookings to avoid foreign key constraints errors
        Booking.query.delete()
        # Clear existing bikes
        Bike.query.delete()
        db.session.commit()
        
        # Insert new common bikes
        for bike_data in common_bikes:
            bike = Bike(**bike_data)
            db.session.add(bike)
        
        db.session.commit()
        print("Successfully updated database with common Indian bikes!")

if __name__ == "__main__":
    update_database()
