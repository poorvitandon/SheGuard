import librosa
import numpy as np
import pickle
from pydub import AudioSegment

model = pickle.load(open("voice_model.pkl", "rb"))
scaler = pickle.load(open("scaler.pkl", "rb"))

def convert_to_wav(input_path):
    try:
        audio = AudioSegment.from_file(input_path, format="webm")
        output_path = "converted.wav"
        audio.export(output_path, format="wav")
        return output_path
    except Exception as e:
        print("❌ Conversion Error:", e)
        return None

def extract_features(file_path):
    audio, sr = librosa.load(file_path, duration=3)

    mfcc = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40).T, axis=0)
    delta = np.mean(librosa.feature.delta(mfcc), axis=0)
    chroma = np.mean(librosa.feature.chroma_stft(y=audio, sr=sr).T, axis=0)
    mel = np.mean(librosa.feature.melspectrogram(y=audio, sr=sr).T, axis=0)

    features = np.hstack((mfcc, delta, chroma, mel))

    return features.reshape(1, -1)

def predict_emotion(file_path):
    wav_path = convert_to_wav(file_path)

    if wav_path is None:
        return "error"

    features = extract_features(wav_path)

    # reshape before scaling
    features = scaler.transform(features.reshape(1, -1))

    probs = model.predict_proba(features)[0]

    # ✅ ALL LOGIC INSIDE FUNCTION
    fear_index = list(model.classes_).index("fear")
    calm_index = list(model.classes_).index("calm")

    fear_prob = probs[fear_index]
    calm_prob = probs[calm_index]

    print("Fear:", fear_prob, "Calm:", calm_prob)  # debug

    # ✅ Better decision rule
    if fear_prob > 0.95 and calm_prob <0.4:
        return "fear"
    else:
        return "calm"