import os
import re
import urllib.parse
import requests

TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
TWILIO_WHATSAPP_NUMBER = os.getenv('TWILIO_WHATSAPP_NUMBER', '+14155238886')

WHATSAPP_ACCESS_TOKEN = os.getenv('WHATSAPP_ACCESS_TOKEN')
WHATSAPP_PHONE_NUMBER_ID = os.getenv('WHATSAPP_PHONE_NUMBER_ID')

def sanitize_phone_number(phone):
    """
    Cleans phone number and formats to international format (+91 for 10-digit Indian numbers by default).
    """
    if not phone:
        return None
    cleaned = re.sub(r'[^0-9+]', '', str(phone).strip())
    if len(cleaned) == 10 and not cleaned.startswith('+'):
        return f"+91{cleaned}"
    if not cleaned.startswith('+') and len(cleaned) > 10:
        return f"+{cleaned}"
    return cleaned

def generate_whatsapp_link(phone, text):
    """
    Generates a direct Click-to-Chat WhatsApp URL for web and mobile apps.
    """
    clean_digits = re.sub(r'[^0-9]', '', str(phone or ''))
    encoded_text = urllib.parse.quote(text)
    return f"https://api.whatsapp.com/send?phone={clean_digits}&text={encoded_text}"

def format_booking_whatsapp_message(booking_data, user_name="Rider", status="Confirmed"):
    """
    Builds clean, professional WhatsApp template message with bold styling and emojis.
    """
    bike_name = booking_data.get('bike_name') or 'RideX Premium Bike'
    bike_brand = booking_data.get('bike_brand') or ''
    full_bike = f"{bike_brand} {bike_name}".strip()
    
    pickup = booking_data.get('pickup_location') or booking_data.get('pickup_station_name') or 'RideX Hub'
    dropoff = booking_data.get('dropoff_location') or booking_data.get('dropoff_station_name') or pickup
    
    start_time = booking_data.get('start_time', '').replace('T', ' ')[:16]
    end_time = booking_data.get('end_time', '').replace('T', ' ')[:16]
    price = booking_data.get('total_price', 0.0)
    pay_method = booking_data.get('payment_method', 'Online')
    booking_id = booking_data.get('id', 'N/A')

    if status == "Confirmed":
        message = (
            f"🛵 *RideX Booking Confirmation*\n\n"
            f"Hello *{user_name}*,\n"
            f"Your ride booking has been *CONFIRMED*! ✅\n\n"
            f"━━━━━━━━━━━━━━━━━━━\n"
            f"📋 *Booking ID:* #{booking_id}\n"
            f"🏍️ *Bike:* {full_bike}\n"
            f"📍 *Pickup Location:* {pickup}\n"
            f"🏁 *Drop-off Location:* {dropoff}\n"
            f"⏰ *Pickup Time:* {start_time}\n"
            f"⏳ *Return Time:* {end_time}\n"
            f"💰 *Total Paid:* ₹{price}\n"
            f"💳 *Payment Mode:* {pay_method}\n"
            f"━━━━━━━━━━━━━━━━━━━\n\n"
            f"Helmet is complimentary with every ride. Please carry your Driving License.\n\n"
            f"📞 *24/7 Roadside Assistance:* +91 9811002233\n"
            f"Have a great and safe journey with *RideX*! 🏍️💨"
        )
    elif status == "Cancelled":
        message = (
            f"⚠️ *RideX Booking Cancellation*\n\n"
            f"Hello *{user_name}*,\n"
            f"Your booking *#{booking_id}* for *{full_bike}* has been *CANCELLED* ❌.\n\n"
            f"If payment was deducted, refund of ₹{price} will be credited to your original payment mode ({pay_method}) within 2-4 business days.\n\n"
            f"For any queries, please call us at +91 9811002233."
        )
    else:
        message = (
            f"ℹ️ *RideX Booking Update*\n\n"
            f"Hello *{user_name}*,\n"
            f"Status of your booking *#{booking_id}* is now: *{status.upper()}*.\n\n"
            f"Bike: {full_bike}\n"
            f"Pickup: {pickup}\n"
            f"Support: +91 9811002233"
        )
    return message

def send_whatsapp_notification(phone, message_text):
    """
    Sends WhatsApp message via Twilio / Meta Cloud API, or returns simulation link if API keys not set.
    """
    clean_phone = sanitize_phone_number(phone)
    if not clean_phone:
        return {
            "success": False,
            "error": "Invalid or missing phone number for WhatsApp notification."
        }

    whatsapp_link = generate_whatsapp_link(clean_phone, message_text)

    # 1. Try Twilio if credentials are provided
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
        try:
            from twilio.rest import Client
            client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
            twilio_to = f"whatsapp:{clean_phone}"
            twilio_from = f"whatsapp:{TWILIO_WHATSAPP_NUMBER}"
            msg = client.messages.create(
                body=message_text,
                from_=twilio_from,
                to=twilio_to
            )
            print(f"[WhatsApp] Twilio message dispatched: SID {msg.sid} to {clean_phone}")
            return {
                "success": True,
                "provider": "twilio",
                "message_sid": msg.sid,
                "phone": clean_phone,
                "whatsapp_link": whatsapp_link
            }
        except Exception as e:
            print(f"[WhatsApp] Twilio dispatch error: {e}")

    # 2. Try Meta WhatsApp Cloud API if credentials are provided
    if WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID:
        try:
            url = f"https://graph.facebook.com/v18.0/{WHATSAPP_PHONE_NUMBER_ID}/messages"
            headers = {
                "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
                "Content-Type": "application/json"
            }
            payload = {
                "messaging_product": "whatsapp",
                "to": clean_phone.replace('+', ''),
                "type": "text",
                "text": {"body": message_text}
            }
            resp = requests.post(url, json=payload, headers=headers, timeout=10)
            if resp.status_code in [200, 201]:
                print(f"[WhatsApp] Meta Cloud API dispatched successfully to {clean_phone}")
                return {
                    "success": True,
                    "provider": "meta",
                    "phone": clean_phone,
                    "whatsapp_link": whatsapp_link
                }
        except Exception as e:
            print(f"[WhatsApp] Meta Cloud API dispatch error: {e}")

    # 3. Development / Sandbox fallback simulation
    print(f"\n=======================================================")
    print(f"📲 [WHATSAPP DISPATCH] Notification to: {clean_phone}")
    print(f"-------------------------------------------------------")
    print(message_text)
    print(f"Direct WhatsApp Link: {whatsapp_link}")
    print(f"=======================================================\n")

    return {
        "success": True,
        "provider": "simulated",
        "phone": clean_phone,
        "whatsapp_link": whatsapp_link,
        "note": "Live notification link generated. User can click to open in WhatsApp."
    }
