from flask import Flask, request, jsonify
from twilio.rest import Client
from dotenv import load_dotenv
import os

load_dotenv()
app = Flask(__name__)

# Twilio credentials
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = "+15706336063"

client = Client(ACCOUNT_SID, AUTH_TOKEN)


@app.route("/")
def home():
    return "Women Safety Backend Running"


@app.route("/alert", methods=["POST"])
def alert():

    data = request.json

    latitude = data.get("lat")
    longitude = data.get("lng")

    location_link = f"https://maps.google.com/?q={latitude},{longitude}"

    message = client.messages.create(
        body=f"🚨 EMERGENCY! I need help. Location: {location_link}",
        from_=TWILIO_PHONE,
        to="+918081547882"
    )

    return jsonify({"status": "SMS Sent"})


if __name__ == "__main__":
    app.run(debug=True)