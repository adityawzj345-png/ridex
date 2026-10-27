import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import db, Bike, Station

TOP_10_BIKES_DATA = [
    # 1. Commuter Bikes
    {
        "name": "Splendor Plus XTEC",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 20.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "HF Deluxe i3S",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 18.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },

    # 2. 125cc Bikes
    {
        "name": "Shine 125 OBD2",
        "brand": "Honda",
        "type": "125cc",
        "price_per_hour": 25.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Glamour XTEC 125",
        "brand": "Hero",
        "type": "125cc",
        "price_per_hour": 24.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },

    # 3. Street / Naked Bikes
    {
        "name": "Pulsar NS160 Dual ABS",
        "brand": "Bajaj",
        "type": "Street / Naked",
        "price_per_hour": 38.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "MT-15 V2 Deluxe",
        "brand": "Yamaha",
        "type": "Street / Naked",
        "price_per_hour": 45.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },

    # 4. Sports Bikes
    {
        "name": "Apache RTR 160 4V Special",
        "brand": "TVS",
        "type": "Sports",
        "price_per_hour": 40.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "YZF-R15 V4 Racing",
        "brand": "Yamaha",
        "type": "Sports",
        "price_per_hour": 55.0,
        "image_url": "/bikes/sport.jpg"
    },

    # 5. Classic / Retro Bikes
    {
        "name": "Classic 350 Reborn",
        "brand": "Royal Enfield",
        "type": "Classic / Retro",
        "price_per_hour": 65.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Jawa 350 Standard",
        "brand": "Jawa",
        "type": "Classic / Retro",
        "price_per_hour": 60.0,
        "image_url": "/bikes/classic_retro.jpg"
    },

    # 6. Roadster Bikes
    {
        "name": "Hunter 350 Dapper",
        "brand": "Royal Enfield",
        "type": "Roadster",
        "price_per_hour": 50.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "H'ness CB350 DLX",
        "brand": "Honda",
        "type": "Roadster",
        "price_per_hour": 58.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },

    # 7. Performance Bikes
    {
        "name": "Pulsar NS200 USD Fork",
        "brand": "Bajaj",
        "type": "Performance",
        "price_per_hour": 52.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Duke 200 Gen-3",
        "brand": "KTM",
        "type": "Performance",
        "price_per_hour": 70.0,
        "image_url": "/bikes/performance_duke.jpg"
    },

    # 8. Adventure / Dual-Purpose Bikes
    {
        "name": "Xpulse 200 4V Pro",
        "brand": "Hero",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 48.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "Himalayan 450",
        "brand": "Royal Enfield",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 85.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },

    # 9. CNG Bikes
    {
        "name": "Freedom 125 NG04 Disc",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 22.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },

    # 10. Electric Bikes
    {
        "name": "Revolt RV400 BRZ",
        "brand": "Revolt",
        "type": "Electric",
        "price_per_hour": 28.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Oben Rorr Electric",
        "brand": "Oben Electric",
        "type": "Electric",
        "price_per_hour": 32.0,
        "image_url": "/bikes/electric_revolt.jpg"
    }
]

def seed_categories():
    stations = Station.query.all()
    if not stations:
        print("No stations found. Creating a default station...")
        default_station = Station(
            name="Connaught Place Central Hub",
            city="Delhi",
            address="Block C, Inner Circle, Connaught Place",
            contact_number="+91 9811002233",
            latitude=28.6315,
            longitude=77.2167
        )
        db.session.add(default_station)
        db.session.commit()
        stations = [default_station]

    station_count = len(stations)
    added_count = 0
    updated_count = 0

    for idx, b_data in enumerate(TOP_10_BIKES_DATA):
        assigned_station = stations[idx % station_count]
        existing = Bike.query.filter_by(name=b_data["name"]).first()
        if not existing:
            new_bike = Bike(
                name=b_data["name"],
                brand=b_data["brand"],
                type=b_data["type"],
                price_per_hour=b_data["price_per_hour"],
                image_url=b_data["image_url"],
                station_id=assigned_station.id,
                is_available=True
            )
            db.session.add(new_bike)
            added_count += 1
        else:
            existing.type = b_data["type"]
            existing.price_per_hour = b_data["price_per_hour"]
            existing.image_url = b_data["image_url"]
            if not existing.station_id:
                existing.station_id = assigned_station.id
            updated_count += 1

    db.session.commit()
    print(f"Top 10 Categories Seeding Complete: {added_count} added, {updated_count} updated.")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        seed_categories()
