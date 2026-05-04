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
        print("❌ Conversion error:", e)
        return None

def extract_features(file_path):
    try:
        audio, sr = librosa.load(file_path, duration=3)

        mfcc = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40).T, axis=0)
        delta = np.mean(librosa.feature.delta(mfcc), axis=0)
        chroma = np.mean(librosa.feature.chroma_stft(y=audio, sr=sr).T, axis=0)
        mel = np.mean(librosa.feature.melspectrogram(y=audio, sr=sr).T, axis=0)

        return np.hstack((mfcc, delta, chroma, mel))

    except Exception as e:
        print("❌ Feature error:", e)
        return None

def predict_emotion(file_path):
    wav_path = convert_to_wav(file_path)

    if wav_path is None:
        return "error"

    features = extract_features(wav_path)

    if features is None:
        return "error"

    try:
        features = scaler.transform(features.reshape(1, -1))
        prediction = model.predict(features)[0]

        print("Emotion:", prediction)
        return prediction

    except Exception as e:
        print("❌ Prediction error:", e)
        return "error"