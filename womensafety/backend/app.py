import smtplib
from email.mime.text import MIMEText
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
    data = request.get_json()

    latitude = data.get("lat")
    longitude = data.get("lng")

    location_link = f"https://maps.google.com/?q={latitude},{longitude}"

    sender_email = "your_email@gmail.com"
    password = "your_app_password"

    receiver_emails = [
        "contact1@gmail.com",
        "contact2@gmail.com"
    ]

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, password)

        for receiver_email in receiver_emails:
            message = MIMEText(f"🚨 EMERGENCY ALERT!\nLocation: {location_link}")
            message["Subject"] = "Emergency Alert"
            message["From"] = sender_email
            message["To"] = receiver_email

            server.sendmail(sender_email, receiver_email, message.as_string())

        server.quit()

        return jsonify({"status": "Email sent to all contacts"})

    except Exception as e:
        print(e)
        return jsonify({"status": "Error"})
    
if __name__ == "__main__":
    app.run(debug=True)

    print("📥 File received")
print("📂 Saved:", file_path)