import axios from "axios";
import { useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("System Ready");
  const [pendingAlert, setPendingAlert] = useState(false);

  // 🚨 Send SMS Alert
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

  // 🔊 Alarm
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

  // 🎤 Voice Detection (ML)
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

        const blob = new Blob(chunks, { type: "audio/webm" });

        const formData = new FormData();
        formData.append("file", blob, "voice.webm");

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
            }
          );

          console.log("✅ Response:", res.data);

          const emotion = res.data.emotion;
          setStatus("Emotion: " + emotion);

          // ✅ SMART LOGIC (REDUCES FALSE ALARMS)
          if (emotion.toLowerCase() === "fear") {
            setPendingAlert(true);
            setStatus("⚠️ Possible distress detected...");

            setTimeout(() => {
              if (pendingAlert) {
                setStatus("🚨 Distress confirmed!");
                sendAlert();
                startAlarm();
                setPendingAlert(false);
              }
            }, 2000);

          } else {
            setStatus("✅ Safe");
            setPendingAlert(false);
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

  // 📸 Camera (placeholder)
  const cameraFeature = () => {
    setStatus("📸 Camera module");
  };

  return (
    <div className="app">

      <h1 className="title">🛡️ SheGuard</h1>

      {/* 🔴 PANIC BUTTON */}
      <button className="panic-btn" onClick={sendAlert}>
        🚨
      </button>

      <p className="panic-label">Tap Immediately in Emergency</p>

      {/* ⚙️ ACTION BUTTONS */}
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

      {/* 🛑 STOP ALARM */}
      <button className="stop-btn" onClick={stopAlarm}>
        Stop Alarm
      </button>

      {/* 🚫 CANCEL ALERT (SMART FEATURE) */}
      {pendingAlert && (
        <button
          className="cancel-btn"
          onClick={() => {
            setPendingAlert(false);
            setStatus("❌ Alert cancelled");
          }}
        >
          Cancel Alert
        </button>
      )}

      {/* 📊 STATUS DISPLAY */}
      <div className="status">{status}</div>

      {/* 🔊 AUDIO */}
      <audio id="alarmAudio" src="/alarm.mp3"></audio>

    </div>
  );
}

export default App;