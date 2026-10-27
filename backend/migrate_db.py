import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'instance', 'ridex.db')
if not os.path.exists(db_path):
    db_path = os.path.join(os.path.dirname(__file__), 'ridex.db')

print("Migrating database...")
con = sqlite3.connect(db_path)
cur = con.cursor()

# Create station table if not exists
cur.execute('''
CREATE TABLE IF NOT EXISTS station (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    address VARCHAR(250) NOT NULL,
    contact_number VARCHAR(20),
    latitude FLOAT,
    longitude FLOAT,
    is_active BOOLEAN DEFAULT 1
);
''')

def add_col(table, col, col_type):
    try:
        cur.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type};")
        print(f"Added {col} to {table}")
    except Exception as e:
        print(f"{table}.{col} already exists or error: {e}")

add_col('bike', 'station_id', 'INTEGER REFERENCES station(id)')
add_col('user', 'license_number', 'VARCHAR(50)')
add_col('user', 'license_image_url', 'VARCHAR(500)')
add_col('user', 'kyc_status', "VARCHAR(20) DEFAULT 'Verified'")
add_col('user', 'kyc_rejected_reason', 'VARCHAR(200)')

add_col('booking', 'pickup_station_id', 'INTEGER REFERENCES station(id)')
add_col('booking', 'dropoff_station_id', 'INTEGER REFERENCES station(id)')
add_col('booking', 'pickup_location', 'VARCHAR(250)')
add_col('booking', 'dropoff_location', 'VARCHAR(250)')
add_col('booking', 'whatsapp_number', 'VARCHAR(30)')
add_col('booking', 'whatsapp_status', "VARCHAR(30) DEFAULT 'Pending'")
add_col('booking', 'payment_method', "VARCHAR(50) DEFAULT 'Razorpay'")
add_col('booking', 'payment_id', 'VARCHAR(100)')

# Default all users to Verified so existing users aren't locked out
cur.execute("UPDATE user SET kyc_status = 'Verified' WHERE kyc_status IS NULL OR kyc_status = 'Unverified';")

# Normalize legacy categories & ensure all prices are strictly under 500
cur.execute("UPDATE bike SET type = 'Sports' WHERE type = 'Sport';")
cur.execute("UPDATE bike SET type = 'Roadster' WHERE type = 'Cruiser';")
cur.execute("UPDATE bike SET type = 'Electric' WHERE type = 'Scooter';")
cur.execute("UPDATE bike SET price_per_hour = 489.0 WHERE price_per_hour >= 500.0;")

con.commit()
con.close()
print("Migration completed!")

# Seed top 10 categories automatically
try:
    from seed_top10_categories import seed_categories
    from app import app
    with app.app_context():
        seed_categories()
except Exception as e:
    print(f"Category seeding note: {e}")
