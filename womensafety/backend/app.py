from flask import Flask, request, jsonify
from twilio.rest import Client
from flask_cors import CORS
from dotenv import load_dotenv
import os
from model import predict_emotion   # ✅ IMPORTANT

load_dotenv()
app = Flask(__name__)
CORS(app)

# Twilio credentials
ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE = "+15706336063"

client = Client(ACCOUNT_SID, AUTH_TOKEN)


@app.route("/")
def home():
    return "Women Safety Backend Running"


# ✅ FIXED: now properly outside
@app.route("/predict", methods=["POST"])
def predict():
    file = request.files["file"]

    file_path = "temp.webm"
    file.save(file_path)

    emotion = predict_emotion(file_path)
    print("🔥 Predict API called")
    print("Emotion:", emotion)

    return jsonify({"emotion": emotion})


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

    print("📥 File received")
print("📂 Saved:", file_path)