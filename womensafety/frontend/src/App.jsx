import axios from "axios";
import { useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("System Ready");

  const sendAlert = () => {
    setStatus("📍 Getting location...");

    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      axios.post("http://127.0.0.1:5000/alert", { lat, lng })
        .then(() => setStatus("🚨 ALERT SENT"))
        .catch(() => setStatus("❌ ERROR"));
    });
  };

  const startAlarm = () => {
    const audio = document.getElementById("alarmAudio");
    audio.loop = true;
    audio.play();
    setStatus("🔊 Alarm Activated");
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

        <button className="action-btn" onClick={voiceFeature}>
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