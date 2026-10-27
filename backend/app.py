import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager
from models import db, Station, Bike

# Load environment variables
load_dotenv()

app = Flask(__name__, static_folder='../frontend/dist', static_url_path='/')
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///ridex.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'supersecretkey123')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', os.getenv('SECRET_KEY', 'supersecretkey123'))

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
from routes.stations import stations_bp
from routes.kyc import kyc_bp
from routes.ml_routes import ml_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(bikes_bp, url_prefix='/api/bikes')
app.register_blueprint(bookings_bp, url_prefix='/api/bookings')
app.register_blueprint(users_bp, url_prefix='/api/users')
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(payment_bp, url_prefix='/api/payment')
app.register_blueprint(stations_bp, url_prefix='/api/stations')
app.register_blueprint(kyc_bp, url_prefix='/api/kyc')
app.register_blueprint(ml_bp, url_prefix='/api/ml')

# Create tables and auto-seed if needed
with app.app_context():
    db.create_all()

    # Seed Default Stations
    if Station.query.count() == 0:
        demo_stations = [
            Station(name="Connaught Place Central Hub", city="Delhi", address="Block C, Inner Circle, Connaught Place", contact_number="+91 9811002233", latitude=28.6315, longitude=77.2167),
            Station(name="Indiranagar 100ft Hub", city="Bengaluru", address="100 Feet Road, HAL 2nd Stage, Indiranagar", contact_number="+91 9822003344", latitude=12.9784, longitude=77.6408),
            Station(name="Bandra West Terminal", city="Mumbai", address="Hill Road, Near Bandra Station", contact_number="+91 9833004455", latitude=19.0596, longitude=72.8295),
            Station(name="Cyber City Station", city="Gurugram", address="DLF Cyber City, Phase 2, Sector 24", contact_number="+91 9844005566", latitude=28.4949, longitude=77.0895),
            Station(name="Koramangala 5th Block Hub", city="Bengaluru", address="Industrial Layout, Koramangala", contact_number="+91 9855006677", latitude=12.9352, longitude=77.6245)
        ]
        db.session.bulk_save_objects(demo_stations)
        db.session.commit()
        print("Default rental stations seeded successfully.")

    # Auto-seed the database with Top 10 categories if needed
    try:
        from seed_top10_categories import seed_categories
        if Bike.query.count() < 10:
            seed_categories()
            print("Database seeded with Top 10 Categories.")
    except Exception as e:
        print(f"Error seeding categories: {e}")

    # Ensure all existing bikes have a station_id
    first_station = Station.query.first()
    if first_station:
        bikes_without_station = Bike.query.filter_by(station_id=None).all()
        for b in bikes_without_station:
            b.station_id = first_station.id
        if bikes_without_station:
            db.session.commit()

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return app.send_static_file(path)
    else:
        return app.send_static_file('index.html')

@app.route('/uploads/<category>/<filename>')
def uploaded_file(category, filename):
    from flask import send_from_directory
    upload_dir = os.path.join(app.root_path, 'uploads', category)
    return send_from_directory(upload_dir, filename)

@app.route("/api/test")
def test():
    return {
        "status": "success",
        "message": "RideX API is running smoothly"
    }

if __name__ == "__main__":
    os.makedirs(os.path.join(app.root_path, 'uploads', 'bikes'), exist_ok=True)
    os.makedirs(os.path.join(app.root_path, 'uploads', 'kyc'), exist_ok=True)
    app.run(debug=True, port=5000)
