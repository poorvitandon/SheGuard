import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import base64
from model import predict_emotion

load_dotenv()

app = Flask(__name__)
CORS(app)

SENDER_EMAIL = os.getenv("SENDER_EMAIL")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

RECEIVERS = [
    "poorvitandon854@gmail.com",
    "harshitpant2275@gmail.com"
]

@app.route("/")
def home():
    return "Backend Running"


@app.route("/predict", methods=["POST"])
def predict():
    file = request.files.get("file")

    if not file:
        return jsonify({"error": "No file"}), 400

    file_path = "temp.webm"
    file.save(file_path)

    emotion = predict_emotion(file_path)
    return jsonify({"emotion": emotion})


@app.route("/alert", methods=["POST"])
def alert():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data"}), 400

    lat = data.get("lat")
    lng = data.get("lng")
    image = data.get("image")

    print("📸 Image received:", "YES" if image else "NO")

    location_link = f"https://maps.google.com/?q={lat},{lng}"

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(SENDER_EMAIL, EMAIL_PASSWORD)

        for receiver in RECEIVERS:
            msg = MIMEMultipart()
            msg["Subject"] = "🚨 Emergency Alert"
            msg["From"] = SENDER_EMAIL
            msg["To"] = receiver

            msg.attach(MIMEText(f"Location: {location_link}", "plain"))

            # 📸 IMAGE ATTACHMENT
            if image and "base64" in image:
                header, encoded = image.split(",", 1)
                image_bytes = base64.b64decode(encoded)

                print("📸 Image size:", len(image_bytes))

                with open("alert.png", "wb") as f:
                    f.write(image_bytes)

                with open("alert.png", "rb") as f:
                    img = MIMEImage(f.read())
                    msg.attach(img)

                print("📸 Image attached")

            server.sendmail(SENDER_EMAIL, receiver, msg.as_string())

        server.quit()

        print("📩 Email sent successfully")

        return jsonify({"status": "sent"})

    except Exception as e:
        print("❌ Error:", e)
        return jsonify({"error": str(e)})


if __name__ == "__main__":
    print("🔥 Starting server...")
    app.run(debug=True)