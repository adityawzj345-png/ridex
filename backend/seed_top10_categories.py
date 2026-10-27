import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import db, Bike, Station

TOP_10_BIKES_DATA = [
    # ================= 1. COMMUTER BIKES (7 Models) =================
    {
        "name": "Splendor Plus XTEC 2.0",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 20.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "HF Deluxe Self-Start i3S",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 18.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "CD 110 Dream Deluxe",
        "brand": "Honda",
        "type": "Commuter",
        "price_per_hour": 20.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Radeon Digi-Drum Edition",
        "brand": "TVS",
        "type": "Commuter",
        "price_per_hour": 22.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Platina 110 Comfortec ABS",
        "brand": "Bajaj",
        "type": "Commuter",
        "price_per_hour": 19.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Sport Kick-Start Mileage",
        "brand": "TVS",
        "type": "Commuter",
        "price_per_hour": 18.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Passion Plus i3S Fi",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 22.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },

    # ================= 2. 125CC BIKES (7 Models) =================
    {
        "name": "Shine 125 OBD2 Disc",
        "brand": "Honda",
        "type": "125cc",
        "price_per_hour": 25.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Raider 125 SmartXonnect",
        "brand": "TVS",
        "type": "125cc",
        "price_per_hour": 28.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Glamour XTEC 125 Fi",
        "brand": "Hero",
        "type": "125cc",
        "price_per_hour": 24.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Pulsar 125 Carbon Single-Seat",
        "brand": "Bajaj",
        "type": "125cc",
        "price_per_hour": 28.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "SP 125 Disc Bluetooth",
        "brand": "Honda",
        "type": "125cc",
        "price_per_hour": 27.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Xtreme 125R Single ABS",
        "brand": "Hero",
        "type": "125cc",
        "price_per_hour": 30.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "CT 125X Rugged",
        "brand": "Bajaj",
        "type": "125cc",
        "price_per_hour": 23.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },

    # ================= 3. STREET / NAKED BIKES (7 Models) =================
    {
        "name": "Pulsar NS160 Dual ABS",
        "brand": "Bajaj",
        "type": "Street / Naked",
        "price_per_hour": 38.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "MT-15 V2 Deluxe Metallic",
        "brand": "Yamaha",
        "type": "Street / Naked",
        "price_per_hour": 45.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Apache RTR 160 2V BT",
        "brand": "TVS",
        "type": "Street / Naked",
        "price_per_hour": 35.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Hornet 2.0 Repsol Edition",
        "brand": "Honda",
        "type": "Street / Naked",
        "price_per_hour": 42.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Xtreme 160R 4V Pro",
        "brand": "Hero",
        "type": "Street / Naked",
        "price_per_hour": 38.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Gixxer 150 FI Disc",
        "brand": "Suzuki",
        "type": "Street / Naked",
        "price_per_hour": 39.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Pulsar N160 Dual-Channel",
        "brand": "Bajaj",
        "type": "Street / Naked",
        "price_per_hour": 40.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },

    # ================= 4. SPORTS BIKES (7 Models) =================
    {
        "name": "YZF-R15 V4 Racing Blue",
        "brand": "Yamaha",
        "type": "Sports",
        "price_per_hour": 55.0,
        "image_url": "/bikes/sport.jpg"
    },
    {
        "name": "Apache RTR 160 4V Special",
        "brand": "TVS",
        "type": "Sports",
        "price_per_hour": 40.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "YZF-R15M Quickshifter Edition",
        "brand": "Yamaha",
        "type": "Sports",
        "price_per_hour": 60.0,
        "image_url": "/bikes/sport.jpg"
    },
    {
        "name": "Gixxer SF 150 Ride Connect",
        "brand": "Suzuki",
        "type": "Sports",
        "price_per_hour": 45.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "Pulsar RS200 Dual ABS",
        "brand": "Bajaj",
        "type": "Sports",
        "price_per_hour": 55.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "Apache RR 310 BTO Track",
        "brand": "TVS",
        "type": "Sports",
        "price_per_hour": 75.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "RC 200 GP Edition",
        "brand": "KTM",
        "type": "Sports",
        "price_per_hour": 70.0,
        "image_url": "/bikes/sports_apache.jpg"
    },

    # ================= 5. CLASSIC / RETRO BIKES (7 Models) =================
    {
        "name": "Classic 350 Reborn Dark",
        "brand": "Royal Enfield",
        "type": "Classic / Retro",
        "price_per_hour": 65.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Bullet 350 Standard Military",
        "brand": "Royal Enfield",
        "type": "Classic / Retro",
        "price_per_hour": 60.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Jawa 350 Standard Maroon",
        "brand": "Jawa",
        "type": "Classic / Retro",
        "price_per_hour": 60.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Jawa 42 2.1 Matte Black",
        "brand": "Jawa",
        "type": "Classic / Retro",
        "price_per_hour": 58.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Yezdi Roadster Dual-Tone",
        "brand": "Yezdi",
        "type": "Classic / Retro",
        "price_per_hour": 62.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Classic 350 Signals Marsh Grey",
        "brand": "Royal Enfield",
        "type": "Classic / Retro",
        "price_per_hour": 68.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Imperiale 400 Classic",
        "brand": "Benelli",
        "type": "Classic / Retro",
        "price_per_hour": 65.0,
        "image_url": "/bikes/classic_retro.jpg"
    },

    # ================= 6. ROADSTER BIKES (7 Models) =================
    {
        "name": "Hunter 350 Dapper Ash",
        "brand": "Royal Enfield",
        "type": "Roadster",
        "price_per_hour": 50.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "Hunter 350 Rebel Red Dual",
        "brand": "Royal Enfield",
        "type": "Roadster",
        "price_per_hour": 52.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "H'ness CB350 Legacy Edition",
        "brand": "Honda",
        "type": "Roadster",
        "price_per_hour": 60.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "CB350RS Monotone Black",
        "brand": "Honda",
        "type": "Roadster",
        "price_per_hour": 62.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "Speed 400 Carnival Red",
        "brand": "Triumph",
        "type": "Roadster",
        "price_per_hour": 75.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "X440 Vivid Metallic",
        "brand": "Harley-Davidson",
        "type": "Roadster",
        "price_per_hour": 80.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "Mavrick 440 Mid Edition",
        "brand": "Hero",
        "type": "Roadster",
        "price_per_hour": 70.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },

    # ================= 7. PERFORMANCE BIKES (7 Models) =================
    {
        "name": "Pulsar NS200 USD Fork 2026",
        "brand": "Bajaj",
        "type": "Performance",
        "price_per_hour": 52.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Duke 200 Gen-3 Electronic",
        "brand": "KTM",
        "type": "Performance",
        "price_per_hour": 70.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Pulsar N250 Dual-ABS Slipper",
        "brand": "Bajaj",
        "type": "Performance",
        "price_per_hour": 55.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Apache RTR 200 4V Ride Modes",
        "brand": "TVS",
        "type": "Performance",
        "price_per_hour": 50.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Duke 250 Quickshifter+",
        "brand": "KTM",
        "type": "Performance",
        "price_per_hour": 80.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "FZ-25 Monster Energy Edition",
        "brand": "Yamaha",
        "type": "Performance",
        "price_per_hour": 48.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Dominar 250 Factory Tourer",
        "brand": "Bajaj",
        "type": "Performance",
        "price_per_hour": 58.0,
        "image_url": "/bikes/performance_duke.jpg"
    },

    # ================= 8. ADVENTURE / DUAL-PURPOSE (7 Models) =================
    {
        "name": "Xpulse 200 4V Pro Rally",
        "brand": "Hero",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 48.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "Himalayan 450 Kaza Brown",
        "brand": "Royal Enfield",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 85.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "Yezdi Adventure Wolf Grey",
        "brand": "Yezdi",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 75.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "Scram 411 Blazing Black",
        "brand": "Royal Enfield",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 70.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "V-Strom SX 250 Tourer",
        "brand": "Suzuki",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 68.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "250 Adventure Off-Road ABS",
        "brand": "KTM",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 82.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "G 310 GS Adventure Rally",
        "brand": "BMW",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 95.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },

    # ================= 9. CNG BIKES (7 Models / Variants) =================
    {
        "name": "Freedom 125 NG04 Disc LED",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 22.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 NG04 Drum LED",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 20.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 NG04 Drum Base",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 18.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG Eco-Tourer",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 23.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG Dual-Tone",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 24.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG City Fleet",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 20.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG Commercial Cargo",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 22.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },

    # ================= 10. ELECTRIC BIKES (7 Models) =================
    {
        "name": "Revolt RV400 Stealth Black",
        "brand": "Revolt",
        "type": "Electric",
        "price_per_hour": 28.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Revolt RV400 BRZ Light",
        "brand": "Revolt",
        "type": "Electric",
        "price_per_hour": 25.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Oben Rorr Fast-Charge",
        "brand": "Oben Electric",
        "type": "Electric",
        "price_per_hour": 32.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Kratos R Urban Electric",
        "brand": "Tork Motors",
        "type": "Electric",
        "price_per_hour": 35.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "AERA 5000 Geared EV",
        "brand": "Matter",
        "type": "Electric",
        "price_per_hour": 38.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Roadster Electric 6kWh",
        "brand": "Ola Electric",
        "type": "Electric",
        "price_per_hour": 30.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "F77 Mach 2 Recon Hyper",
        "brand": "Ultraviolette",
        "type": "Electric",
        "price_per_hour": 90.0,
        "image_url": "/bikes/electric_revolt.jpg"
    }
]

def seed_categories():
    stations = Station.query.all()
    if not stations:
        print("No stations found. Creating default stations...")
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
            existing.brand = b_data["brand"]
            existing.type = b_data["type"]
            existing.price_per_hour = b_data["price_per_hour"]
            existing.image_url = b_data["image_url"]
            if not existing.station_id:
                existing.station_id = assigned_station.id
            updated_count += 1

    db.session.commit()
    print(f"Top 10 Categories Seeding (7 Models Each) Complete: {added_count} added, {updated_count} updated.")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        seed_categories()
