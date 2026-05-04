import axios from "axios";
import { useState, useEffect, useRef } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("System Ready");
  const [cameraOn, setCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // 📸 CAPTURE PHOTO
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video) { console.log("❌ No video element"); return null; }
    if (video.readyState < 2) { console.log("⏳ Video not ready yet"); return null; }

    const ctx = canvas.getContext("2d");
    const width = video.videoWidth || 300;
    const height = video.videoHeight || 300;
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(video, 0, 0, width, height);
    const imageData = canvas.toDataURL("image/png");
    console.log("📸 Captured:", imageData ? "YES" : "NO");
    setCapturedImage(imageData);
    return imageData;
  };

  // 🚨 SEND ALERT (WITH IMAGE)
  const sendAlert = async () => {
    startAlarm();
    let imageData = capturedImage;
    console.log("📸 Using stored image:", imageData ? "YES" : "NO");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await axios.post("http://127.0.0.1:5000/alert", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          image: imageData,
        });
        setStatus("🚨 ALERT SENT");
      },
      async () => {
        await axios.post("http://127.0.0.1:5000/alert", {
          lat: 28.6,
          lng: 77.2,
          image: imageData,
        });
        setStatus("🚨 ALERT SENT (fallback)");
      }
    );
  };

  // 🔊 ALARM
  const startAlarm = () => {
    const audio = document.getElementById("alarmAudio");
    audio.loop = true;
    audio.currentTime = 0;
    audio.play().catch(() => setStatus("⚠️ Tap again to enable sound"));
  };

  const stopAlarm = () => {
    const audio = document.getElementById("alarmAudio");
    audio.pause();
    audio.currentTime = 0;
    setStatus("Alarm Stopped");
  };

  // 🎤 KEYWORD DETECTION
  const startKeywordListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setStatus("❌ Speech not supported"); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    setStatus("🎤 Listening...");

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      if (text.includes("help") || text.includes("save") || text.includes("bachao")) {
        setStatus("🚨 Keyword detected!");
        sendAlert();
      } else {
        setStatus("❌ No keyword detected");
      }
    };

    recognition.start();
  };

  // 📸 CAMERA
  const startCamera = async () => {
    try {
      setCameraOn(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 200);
      setStatus("📸 Camera started");
    } catch {
      setStatus("❌ Camera denied");
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    setCameraOn(false);
    setStatus("Camera stopped");
  };

  return (
    <div className="app">
      <div className="grain" />
      <div className="glow-bg" />

      {/* Top bar */}
      <header className="topbar">
        <div className="logo">She<span>Guard</span></div>
        <div className="pip-wrap">
          <span className="live-pip" />
          <span className="pip-label">Protected</span>
        </div>
      </header>

      <main className="main">

        {/* SOS */}
        <div className="sos-area">
          <div className="ring-wrap">
            <div className="ring r3" />
            <div className="ring r2" />
            <div className="ring r1" />
            <button className="sos-btn" onClick={sendAlert} aria-label="Send SOS">
              <span className="sos-word">SOS</span>
              <span className="sos-hint">press in emergency</span>
            </button>
          </div>
          <p className="sos-caption">Tap immediately in emergency</p>
        </div>

        {/* Status */}
        <div className="status-bar">
          <span className="s-pip" />
          <span className="s-text">{status}</span>
        </div>

        {/* Cards */}
        <div className="cards">
          <button className="card" onClick={startAlarm}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <span className="card-label">Alarm</span>
            <span className="card-sub">Trigger siren</span>
          </button>

          <button className="card" onClick={startKeywordListening}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </div>
            <span className="card-label">Voice</span>
            <span className="card-sub">Keyword detect</span>
          </button>

          <button className="card" onClick={startCamera}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <path d="M23 7l-7 5 7 5V7z"/>
                <rect x="1" y="5" width="15" height="14" rx="2"/>
              </svg>
            </div>
            <span className="card-label">Camera</span>
            <span className="card-sub">Record evidence</span>
          </button>
        </div>

        {/* Camera panel */}
        {cameraOn && (
          <div className="camera-panel">
            <video ref={videoRef} autoPlay className="camera-feed" />
            <div className="camera-actions">
              <button className="cam-btn cam-capture" onClick={capturePhoto}>Capture</button>
              <button className="cam-btn cam-close" onClick={stopCamera}>Close</button>
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        )}

        {/* Image preview */}
        {capturedImage && (
          <div className="preview-panel">
            <p className="preview-label">Captured</p>
            <img src={capturedImage} className="preview-img" alt="Captured" />
          </div>
        )}

        {/* Stop alarm */}
        <button className="stop-btn" onClick={stopAlarm}>Stop Alarm</button>

        <p className="footer-note">Location is only shared when you trigger an alert</p>
      </main>

      <audio id="alarmAudio" src="/alarm.mp3"></audio>
    </div>
  );
}

export default App;
