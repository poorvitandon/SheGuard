import librosa
import numpy as np
import os
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.svm import SVC

X = []
y = []

dataset_path = "dataset"

print("🔄 Loading dataset...")

# 🔹 Feature extraction function
def extract_features(file_path):
    audio, sr = librosa.load(file_path, duration=3)

    mfcc = np.mean(librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=40).T, axis=0)
    delta = np.mean(librosa.feature.delta(mfcc), axis=0)

    chroma = np.mean(librosa.feature.chroma_stft(y=audio, sr=sr).T, axis=0)
    mel = np.mean(librosa.feature.melspectrogram(y=audio, sr=sr).T, axis=0)

    return np.hstack((mfcc, delta, chroma, mel))


# 🔹 Load data
for emotion in ["fear", "calm"]:
    folder = os.path.join(dataset_path, emotion)

    for file in os.listdir(folder):
        file_path = os.path.join(folder, file)

        try:
            features = extract_features(file_path)
            X.append(features)
            y.append(emotion)

        except Exception as e:
            print("❌ Error:", file_path)

X = np.array(X)
y = np.array(y)

print("✅ Data loaded")

# 🔹 Normalize features
scaler = StandardScaler()
X = scaler.fit_transform(X)

# 🔹 Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 🔹 Train model
model = SVC(kernel='rbf', class_weight='balanced', probability=True)
model.fit(X_train, y_train)

print("🚀 Model trained")

# 🔹 Evaluate model
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)
print(f"🎯 Accuracy: {accuracy:.2f}")

print("\n📊 Classification Report:")
print(classification_report(y_test, y_pred))

# 🔹 Save model + scaler
pickle.dump(model, open("voice_model.pkl", "wb"))
pickle.dump(scaler, open("scaler.pkl", "wb"))

print("💾 Model + scaler saved!")