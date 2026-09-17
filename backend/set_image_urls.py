from app import app, db
from models import Bike

def update_images():
    with app.app_context():
        bikes = Bike.query.all()
        for bike in bikes:
            # Map the type to the corresponding image file
            if bike.type.lower() == "scooter":
                bike.image_url = "/bikes/scooter.jpg"
            elif bike.type.lower() == "sport" or bike.type.lower() == "naked":
                bike.image_url = "/bikes/sport.jpg"
            elif bike.type.lower() == "cruiser":
                bike.image_url = "/bikes/cruiser.jpg"
            elif bike.type.lower() == "commuter":
                bike.image_url = "/bikes/commuter.jpg"
            else:
                bike.image_url = "/bikes/commuter.jpg" # fallback
        
        db.session.commit()
        print("Successfully updated bike images in the database!")

if __name__ == "__main__":
    update_images()
