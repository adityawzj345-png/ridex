from app import app, db
from models import Bike

mock_bikes = [
    { "name": "Ninja ZX-10R", "brand": "Kawasaki", "type": "Sport", "price_per_hour": 45, "image_url": "🏍️" },
    { "name": "Iron 883", "brand": "Harley-Davidson", "type": "Cruiser", "price_per_hour": 35, "image_url": "🏍️" },
    { "name": "Duke 390", "brand": "KTM", "type": "Naked", "price_per_hour": 20, "image_url": "🏍️" },
    { "name": "R1", "brand": "Yamaha", "type": "Sport", "price_per_hour": 40, "image_url": "🏍️" },
    { "name": "Vespa Elettrica", "brand": "Vespa", "type": "Scooter", "price_per_hour": 15, "image_url": "🛵" },
    { "name": "Scrambler", "brand": "Ducati", "type": "Classic", "price_per_hour": 30, "image_url": "🏍️" }
]

def seed_database():
    with app.app_context():
        # Check if database is already seeded
        if Bike.query.count() == 0:
            for bike_data in mock_bikes:
                bike = Bike(**bike_data)
                db.session.add(bike)
            db.session.commit()
            print("Successfully added 6 demo bikes to the database!")
        else:
            print("Database already contains bikes.")

if __name__ == "__main__":
    seed_database()
