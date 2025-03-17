import pyaudio
import numpy as np
import librosa
import torch
import torch.nn as nn
import pickle

# Mapping for CREMA-D (6 classes)
unique_labels = ["anger", "disgust", "fear", "happy", "neutral", "sad"]
label_to_index = {label: idx for idx, label in enumerate(unique_labels)}
index_to_label = {idx: label for label, idx in label_to_index.items()}
NUM_CLASSES = len(unique_labels)

# Define the CNN model
class SimpleAudioCNN(nn.Module):
    def __init__(self, num_classes):
        super(SimpleAudioCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2,2)
        self.dropout = nn.Dropout(0.3)
        self.relu = nn.ReLU()
        self.fc1 = nn.Linear(64 * 5 * 16, 128)
        self.fc2 = nn.Linear(128, num_classes)
    def forward(self, x):
        x = self.pool(self.relu(self.conv1(x)))
        x = self.pool(self.relu(self.conv2(x)))
        x = self.pool(self.relu(self.conv3(x)))
        x = x.view(x.size(0), -1)
        x = self.dropout(self.relu(self.fc1(x)))
        return self.fc2(x)

# Load the pre-trained model checkpoint
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = SimpleAudioCNN(num_classes=NUM_CLASSES)
with open("trained_crema_emotion_model.pkl", "rb") as f:
    state_dict = pickle.load(f)
model.load_state_dict(state_dict)
model.to(device)
model.eval()
print("Model loaded on device:", device)

# Parameters for real-time audio capture and processing
CHUNK = 1024                # Samples per frame
FORMAT = pyaudio.paFloat32  # 32-bit float
CHANNELS = 1                # Mono audio
RATE = 22050                # Sampling rate in Hz
SILENCE_THRESHOLD = 0.01    # RMS threshold for silence detection
SILENCE_DURATION = 1.5      # Seconds of silence to trigger inference
RECORD_SECONDS = 3          # Fixed length for each utterance (in seconds)
SAMPLES_PER_UTTERANCE = int(RATE * RECORD_SECONDS)

def rms(signal):
    return np.sqrt(np.mean(np.square(signal)))

def extract_mfcc(signal):
    mfcc = librosa.feature.mfcc(y=signal, sr=RATE, n_mfcc=40, hop_length=512)
    mfcc = (mfcc - np.mean(mfcc)) / np.std(mfcc)
    return np.expand_dims(mfcc, axis=0)  # shape: (1, 40, t)

def listen_and_predict():
    p = pyaudio.PyAudio()
    stream = p.open(format=FORMAT, channels=CHANNELS, rate=RATE,
                    input=True, frames_per_buffer=CHUNK)
    print("Listening... (Pause for {:.1f}s to end utterance)".format(SILENCE_DURATION))
    frames = []
    silent_chunks = 0
    required_silent_chunks = int((SILENCE_DURATION * RATE) / CHUNK)
    try:
        while True:
            data = stream.read(CHUNK, exception_on_overflow=False)
            chunk = np.frombuffer(data, dtype=np.float32)
            frames.append(chunk)
            if rms(chunk) < SILENCE_THRESHOLD:
                silent_chunks += 1
            else:
                silent_chunks = 0
            if silent_chunks >= required_silent_chunks and len(frames) > required_silent_chunks:
                print("\nSilence detected. Processing utterance...")
                utterance = np.concatenate(frames)
                frames = []
                silent_chunks = 0
                if len(utterance) < SAMPLES_PER_UTTERANCE:
                    utterance = np.pad(utterance, (0, SAMPLES_PER_UTTERANCE - len(utterance)), 'constant')
                else:
                    utterance = utterance[-SAMPLES_PER_UTTERANCE:]
                mfcc = extract_mfcc(utterance)
                mfcc_tensor = torch.tensor(mfcc, dtype=torch.float32).unsqueeze(0).to(device)
                with torch.no_grad():
                    outputs = model(mfcc_tensor)
                    _, predicted = torch.max(outputs, 1)
                    emotion = index_to_label[predicted.item()]
                    print("Detected Emotion:", emotion)
                print("\nListening for next utterance...")
    except KeyboardInterrupt:
        print("Stopping...")
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

if __name__ == "__main__":
    listen_and_predict()
