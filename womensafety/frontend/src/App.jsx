import axios from "axios";
import { useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("System Ready");

  const sendAlert = () => {

  startAlarm();

  setStatus("📍 Getting location...");

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      axios
        .post("http://127.0.0.1:5000/alert", { lat, lng })
        .then(() => setStatus("🚨 ALERT SENT"))
        .catch(() => setStatus("❌ ERROR"));
    },
    (err) => {
      console.error(err);
      setStatus("❌ Location access denied");
    }
  );
};

  const startAlarm = () => {
  const audio = document.getElementById("alarmAudio");

  audio.loop = true;
  audio.currentTime = 0;

  audio.play()
    .then(() => {
      setStatus("🔊 Alarm Activated");
    })
    .catch((err) => {
      console.log("Audio blocked:", err);
      setStatus("⚠️ Click again to enable sound");
    });
};

  const stopAlarm = () => {
    const audio = document.getElementById("alarmAudio");
    audio.pause();
    audio.currentTime = 0;
    setStatus("Alarm Stopped");
  };

  const voiceFeature = () => {
    setStatus("🎤 Voice detection module");
  };
  const recordVoice = async () => {
    console.log("🎤 Button clicked");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      let chunks = [];

      mediaRecorder.start();
      setStatus("🎤 Recording...");

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        console.log("⏹ Recording stopped");

        const blob = new Blob(chunks, { type: "audio/wav" });

        const formData = new FormData();
        formData.append("file", blob, "voice.wav");

        setStatus("🧠 Analyzing voice...");

        try {
          console.log("📤 Sending to backend...");

          const res = await axios.post(
            "http://127.0.0.1:5000/predict",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            },
          );

          console.log("✅ Response:", res.data);

          const emotion = res.data.emotion;

          if (emotion.toLowerCase() === "fear") {
            setStatus("🚨 Distress detected! Emotion: " + emotion);
            sendAlert();
            startAlarm();
          } else {
            setStatus("✅ Safe | Emotion: " + emotion);
          }
        } catch (error) {
          console.error("❌ Backend Error:", error);
          setStatus("❌ Failed to analyze voice");
        }
      };

      // ⏱ Stop after 3 seconds
      setTimeout(() => {
        mediaRecorder.stop();
      }, 3000);
    } catch (error) {
      console.error("❌ Mic Error:", error);
      setStatus("❌ Microphone access denied");
    }
  };
  const cameraFeature = () => {
    setStatus("📸 Camera module");
  };

  return (
    <div className="app">
      <h1 className="title">🛡️ SheGuard</h1>

      {/* 🔴 MAIN PANIC BUTTON */}
      <button className="panic-btn" onClick={sendAlert}>
        🚨
      </button>

      <p className="panic-label">Tap Immediately in Emergency</p>

      {/* ⚙️ Secondary Controls */}
      <div className="actions">
        <button className="action-btn" onClick={startAlarm}>
          🔊 Alarm
        </button>

        <button className="action-btn" onClick={recordVoice}>
          🎤 Voice
        </button>

        <button className="action-btn" onClick={cameraFeature}>
          📸 Camera
        </button>
      </div>

      {/* Stop Alarm */}
      <button className="stop-btn" onClick={stopAlarm}>
        Stop Alarm
      </button>

      {/* Status */}
      <div className="status">{status}</div>

      <audio id="alarmAudio" src="/alarm.mp3"></audio>
    </div>
  );
}

export default App;
