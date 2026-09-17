import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from models import db

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///ridex.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_secret')
app.config['JWT_SECRET_KEY'] = os.getenv('SECRET_KEY', 'default_jwt_secret')

# Initialize DB with app
db.init_app(app)

# Initialize JWT
jwt = JWTManager(app)

# Register Blueprints
from routes.auth import auth_bp
from routes.bikes import bikes_bp
from routes.bookings import bookings_bp
from routes.users import users_bp
from routes.admin import admin_bp
from routes.payment import payment_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(bikes_bp, url_prefix='/api/bikes')
app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(payment_bp, url_prefix='/api/payment')

# Create tables if they don't exist
with app.app_context():
    db.create_all()
    
    # Auto-seed the database with bikes if it is empty
    from models import Bike
    if Bike.query.count() == 0:
        demo_bikes = [
            Bike(name="Ninja ZX-10R", brand="Kawasaki", type="Sport", price_per_hour=45.0, image_url="/bikes/sport.jpg"),
            Bike(name="Iron 883", brand="Harley-Davidson", type="Cruiser", price_per_hour=55.0, image_url="/bikes/cruiser.jpg"),
            Bike(name="Vespa Primavera", brand="Vespa", type="Scooter", price_per_hour=15.0, image_url="/bikes/scooter.jpg"),
            Bike(name="CB300R", brand="Honda", type="Commuter", price_per_hour=25.0, image_url="/bikes/commuter.jpg")
        ]
        db.session.bulk_save_objects(demo_bikes)
        db.session.commit()
        print("Database seeded successfully with default bikes.")

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')

@app.route('/uploads/bikes/<filename>')
def uploaded_file(filename):
    from flask import send_from_directory
    return send_from_directory(os.path.join(app.root_path, 'uploads', 'bikes'), filename)

@app.route("/api/test")
def test():
    return {
        "status": "success",
        "message": "RideX API is working"
    }

if __name__ == "__main__":
    # Ensure uploads directory exists
    os.makedirs(os.path.join(app.root_path, 'uploads', 'bikes'), exist_ok=True)
    app.run(debug=True, port=5000)
