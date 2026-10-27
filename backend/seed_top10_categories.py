import os
import sys

# Ensure backend root is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import db, Bike, Station

TOP_10_BIKES_DATA = [
    # ================= 1. COMMUTER BIKES (Under ₹50/hr) =================
    {
        "name": "HF Deluxe Self-Start i3S",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 29.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Sport Kick-Start Mileage",
        "brand": "TVS",
        "type": "Commuter",
        "price_per_hour": 29.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Splendor Plus XTEC 2.0",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 35.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "CD 110 Dream Deluxe",
        "brand": "Honda",
        "type": "Commuter",
        "price_per_hour": 35.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Platina 110 Comfortec ABS",
        "brand": "Bajaj",
        "type": "Commuter",
        "price_per_hour": 35.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Radeon Digi-Drum Edition",
        "brand": "TVS",
        "type": "Commuter",
        "price_per_hour": 38.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },
    {
        "name": "Passion Plus i3S Fi",
        "brand": "Hero",
        "type": "Commuter",
        "price_per_hour": 39.0,
        "image_url": "/bikes/commuter_splendor.jpg"
    },

    # ================= 2. 125CC BIKES (₹45 - ₹69/hr) =================
    {
        "name": "CT 125X Rugged",
        "brand": "Bajaj",
        "type": "125cc",
        "price_per_hour": 45.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Glamour XTEC 125 Fi",
        "brand": "Hero",
        "type": "125cc",
        "price_per_hour": 49.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Shine 125 OBD2 Disc",
        "brand": "Honda",
        "type": "125cc",
        "price_per_hour": 55.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "SP 125 Disc Bluetooth",
        "brand": "Honda",
        "type": "125cc",
        "price_per_hour": 58.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Pulsar 125 Carbon Single-Seat",
        "brand": "Bajaj",
        "type": "125cc",
        "price_per_hour": 59.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Raider 125 SmartXonnect",
        "brand": "TVS",
        "type": "125cc",
        "price_per_hour": 65.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },
    {
        "name": "Xtreme 125R Single ABS",
        "brand": "Hero",
        "type": "125cc",
        "price_per_hour": 69.0,
        "image_url": "/bikes/125cc_shine.jpg"
    },

    # ================= 3. CNG BIKES (₹39 - ₹49/hr) =================
    {
        "name": "Freedom 125 NG04 Drum Base",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 39.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 NG04 Drum LED",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 42.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG City Fleet",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 42.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 NG04 Disc LED",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 45.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG Commercial Cargo",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 45.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG Eco-Tourer",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 48.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },
    {
        "name": "Freedom 125 CNG Dual-Tone",
        "brand": "Bajaj",
        "type": "CNG",
        "price_per_hour": 49.0,
        "image_url": "/bikes/cng_freedom.jpg"
    },

    # ================= 4. STREET / NAKED BIKES (₹79 - ₹119/hr) =================
    {
        "name": "Apache RTR 160 2V BT",
        "brand": "TVS",
        "type": "Street / Naked",
        "price_per_hour": 79.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Pulsar NS160 Dual ABS",
        "brand": "Bajaj",
        "type": "Street / Naked",
        "price_per_hour": 89.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Xtreme 160R 4V Pro",
        "brand": "Hero",
        "type": "Street / Naked",
        "price_per_hour": 89.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Gixxer 150 FI Disc",
        "brand": "Suzuki",
        "type": "Street / Naked",
        "price_per_hour": 92.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Pulsar N160 Dual-Channel",
        "brand": "Bajaj",
        "type": "Street / Naked",
        "price_per_hour": 95.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "Hornet 2.0 Repsol Edition",
        "brand": "Honda",
        "type": "Street / Naked",
        "price_per_hour": 99.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },
    {
        "name": "MT-15 V2 Deluxe Metallic",
        "brand": "Yamaha",
        "type": "Street / Naked",
        "price_per_hour": 119.0,
        "image_url": "/bikes/street_pulsarns.jpg"
    },

    # ================= 5. ELECTRIC BIKES (₹59 - ₹249/hr) =================
    {
        "name": "Revolt RV400 BRZ Light",
        "brand": "Revolt",
        "type": "Electric",
        "price_per_hour": 59.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Revolt RV400 Stealth Black",
        "brand": "Revolt",
        "type": "Electric",
        "price_per_hour": 69.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Roadster Electric 6kWh",
        "brand": "Ola Electric",
        "type": "Electric",
        "price_per_hour": 69.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Oben Rorr Fast-Charge",
        "brand": "Oben Electric",
        "type": "Electric",
        "price_per_hour": 79.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "Kratos R Urban Electric",
        "brand": "Tork Motors",
        "type": "Electric",
        "price_per_hour": 85.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "AERA 5000 Geared EV",
        "brand": "Matter",
        "type": "Electric",
        "price_per_hour": 95.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },
    {
        "name": "F77 Mach 2 Recon Hyper",
        "brand": "Ultraviolette",
        "type": "Electric",
        "price_per_hour": 249.0,
        "image_url": "/bikes/electric_revolt.jpg"
    },

    # ================= 6. SPORTS BIKES (₹89 - ₹229/hr) =================
    {
        "name": "Apache RTR 160 4V Special",
        "brand": "TVS",
        "type": "Sports",
        "price_per_hour": 89.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "Gixxer SF 150 Ride Connect",
        "brand": "Suzuki",
        "type": "Sports",
        "price_per_hour": 99.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "Pulsar RS200 Dual ABS",
        "brand": "Bajaj",
        "type": "Sports",
        "price_per_hour": 139.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "YZF-R15 V4 Racing Blue",
        "brand": "Yamaha",
        "type": "Sports",
        "price_per_hour": 149.0,
        "image_url": "/bikes/sport.jpg"
    },
    {
        "name": "YZF-R15M Quickshifter Edition",
        "brand": "Yamaha",
        "type": "Sports",
        "price_per_hour": 169.0,
        "image_url": "/bikes/sport.jpg"
    },
    {
        "name": "RC 200 GP Edition",
        "brand": "KTM",
        "type": "Sports",
        "price_per_hour": 179.0,
        "image_url": "/bikes/sports_apache.jpg"
    },
    {
        "name": "Apache RR 310 BTO Track",
        "brand": "TVS",
        "type": "Sports",
        "price_per_hour": 229.0,
        "image_url": "/bikes/sports_apache.jpg"
    },

    # ================= 7. CLASSIC / RETRO BIKES (₹139 - ₹179/hr) =================
    {
        "name": "Jawa 42 2.1 Matte Black",
        "brand": "Jawa",
        "type": "Classic / Retro",
        "price_per_hour": 139.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Bullet 350 Standard Military",
        "brand": "Royal Enfield",
        "type": "Classic / Retro",
        "price_per_hour": 145.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Jawa 350 Standard Maroon",
        "brand": "Jawa",
        "type": "Classic / Retro",
        "price_per_hour": 149.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Yezdi Roadster Dual-Tone",
        "brand": "Yezdi",
        "type": "Classic / Retro",
        "price_per_hour": 155.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Imperiale 400 Classic",
        "brand": "Benelli",
        "type": "Classic / Retro",
        "price_per_hour": 159.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Classic 350 Reborn Dark",
        "brand": "Royal Enfield",
        "type": "Classic / Retro",
        "price_per_hour": 169.0,
        "image_url": "/bikes/classic_retro.jpg"
    },
    {
        "name": "Classic 350 Signals Marsh Grey",
        "brand": "Royal Enfield",
        "type": "Classic / Retro",
        "price_per_hour": 179.0,
        "image_url": "/bikes/classic_retro.jpg"
    },

    # ================= 8. ROADSTER BIKES (₹129 - ₹229/hr) =================
    {
        "name": "Hunter 350 Dapper Ash",
        "brand": "Royal Enfield",
        "type": "Roadster",
        "price_per_hour": 129.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "Hunter 350 Rebel Red Dual",
        "brand": "Royal Enfield",
        "type": "Roadster",
        "price_per_hour": 135.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "H'ness CB350 Legacy Edition",
        "brand": "Honda",
        "type": "Roadster",
        "price_per_hour": 149.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "CB350RS Monotone Black",
        "brand": "Honda",
        "type": "Roadster",
        "price_per_hour": 155.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "Mavrick 440 Mid Edition",
        "brand": "Hero",
        "type": "Roadster",
        "price_per_hour": 169.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "Speed 400 Carnival Red",
        "brand": "Triumph",
        "type": "Roadster",
        "price_per_hour": 199.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },
    {
        "name": "X440 Vivid Metallic",
        "brand": "Harley-Davidson",
        "type": "Roadster",
        "price_per_hour": 229.0,
        "image_url": "/bikes/roadster_hunter.jpg"
    },

    # ================= 9. PERFORMANCE BIKES (₹119 - ₹219/hr) =================
    {
        "name": "FZ-25 Monster Energy Edition",
        "brand": "Yamaha",
        "type": "Performance",
        "price_per_hour": 119.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Apache RTR 200 4V Ride Modes",
        "brand": "TVS",
        "type": "Performance",
        "price_per_hour": 125.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Pulsar NS200 USD Fork 2026",
        "brand": "Bajaj",
        "type": "Performance",
        "price_per_hour": 135.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Pulsar N250 Dual-ABS Slipper",
        "brand": "Bajaj",
        "type": "Performance",
        "price_per_hour": 139.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Dominar 250 Factory Tourer",
        "brand": "Bajaj",
        "type": "Performance",
        "price_per_hour": 149.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Duke 200 Gen-3 Electronic",
        "brand": "KTM",
        "type": "Performance",
        "price_per_hour": 175.0,
        "image_url": "/bikes/performance_duke.jpg"
    },
    {
        "name": "Duke 250 Quickshifter+",
        "brand": "KTM",
        "type": "Performance",
        "price_per_hour": 219.0,
        "image_url": "/bikes/performance_duke.jpg"
    },

    # ================= 10. ADVENTURE / DUAL-PURPOSE (₹119 - ₹349/hr) =================
    {
        "name": "Xpulse 200 4V Pro Rally",
        "brand": "Hero",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 119.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "V-Strom SX 250 Tourer",
        "brand": "Suzuki",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 169.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "Scram 411 Blazing Black",
        "brand": "Royal Enfield",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 175.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "Yezdi Adventure Wolf Grey",
        "brand": "Yezdi",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 189.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "250 Adventure Off-Road ABS",
        "brand": "KTM",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 219.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "Himalayan 450 Kaza Brown",
        "brand": "Royal Enfield",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 249.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    },
    {
        "name": "G 310 GS Adventure Rally",
        "brand": "BMW",
        "type": "Adventure / Dual-Purpose",
        "price_per_hour": 349.0,
        "image_url": "/bikes/adventure_xpulse.jpg"
    }
]

# Existing Legacy Superbikes cap under 500
LEGACY_PRICE_OVERRIDES = {
    "Vespa Primavera": 45.0,
    "Vespa Elettrica": 49.0,
    "CB300R": 149.0,
    "Duke 390": 229.0,
    "Iron 883": 399.0,
    "Ninja ZX-10R": 449.0,
    "R1": 489.0
}

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

    # 1. Seed or Update the 70 Category Bikes
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

    # 2. Update Legacy Bikes to be under 500
    for name, p in LEGACY_PRICE_OVERRIDES.items():
        legacy = Bike.query.filter_by(name=name).first()
        if legacy:
            legacy.price_per_hour = p
            updated_count += 1

    # Ensure no bike in DB is above 500 and types are normalized
    all_bikes = Bike.query.all()
    for b in all_bikes:
        if b.type == 'Sport':
            b.type = 'Sports'
        elif b.type == 'Cruiser':
            b.type = 'Roadster'
        elif b.type == 'Scooter':
            b.type = 'Electric'
        if b.price_per_hour > 499.0:
            b.price_per_hour = 489.0
            updated_count += 1

    db.session.commit()
    print(f"Bikes Hourly Pricing Update Complete: {added_count} added, {updated_count} updated. All prices strictly under ₹500/hr.")

if __name__ == "__main__":
    from app import app
    with app.app_context():
        seed_categories()
