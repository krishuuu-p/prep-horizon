import os
import librosa
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import pickle
from tqdm import tqdm

# Fixed unique emotion labels for CREMA-D
unique_labels = ["anger", "disgust", "fear", "happy", "neutral", "sad"]
label_to_index = {label: idx for idx, label in enumerate(unique_labels)}
NUM_CLASSES = len(unique_labels)

# Map emotion abbreviations to labels
emotion_abbr_to_label = {
    "ANG": "anger",
    "DIS": "disgust",
    "FER": "fear",
    "FEA": "fear",
    "HAP": "happy",
    "NEU": "neutral",
    "SAD": "sad"
}

class CREMADataset(Dataset):
    def __init__(self, audio_dir, sr=22050, duration=3, n_mfcc=40, hop_length=512):
        self.audio_dir = audio_dir
        self.sr = sr
        self.duration = duration
        self.n_mfcc = n_mfcc
        self.hop_length = hop_length
        self.samples = int(sr * duration)
        self.audio_files = sorted([f for f in os.listdir(audio_dir) if f.lower().endswith('.wav')])
    
    def __len__(self):
        return len(self.audio_files)
    
    def __getitem__(self, index):
        filename = self.audio_files[index]
        file_path = os.path.join(self.audio_dir, filename)
        parts = filename.split('_')
        if len(parts) < 3:
            raise ValueError(f"Filename {filename} does not follow expected format.")
        emotion_abbr = parts[2]
        label_str = emotion_abbr_to_label.get(emotion_abbr)
        if label_str is None:
            raise ValueError(f"Emotion abbreviation {emotion_abbr} not recognized in file {filename}.")
        label = label_to_index[label_str]
        signal, _ = librosa.load(file_path, sr=self.sr)
        if len(signal) < self.samples:
            signal = np.pad(signal, (0, self.samples - len(signal)), 'constant')
        else:
            signal = signal[:self.samples]
        mfcc = librosa.feature.mfcc(y=signal, sr=self.sr, n_mfcc=self.n_mfcc, hop_length=self.hop_length)
        mfcc = (mfcc - np.mean(mfcc)) / np.std(mfcc)
        mfcc = np.expand_dims(mfcc, axis=0)
        return torch.tensor(mfcc, dtype=torch.float32), torch.tensor(label, dtype=torch.long)

class SimpleAudioCNN(nn.Module):
    def __init__(self, num_classes):
        super(SimpleAudioCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.conv3 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
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

def train_model(model, dataloader, criterion, optimizer, num_epochs=10, device='cpu'):
    model.to(device)
    model.train()
    for epoch in range(num_epochs):
        running_loss, correct, total = 0.0, 0, 0
        progress_bar = tqdm(dataloader, desc=f"Epoch {epoch+1}/{num_epochs}", leave=False)
        for inputs, labels in progress_bar:
            inputs = inputs.to(device)
            labels = labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * inputs.size(0)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            progress_bar.set_postfix(loss=loss.item())
        print(f"Epoch {epoch+1}/{num_epochs}, Loss: {running_loss/total:.4f}, Accuracy: {correct/total:.4f}")
    return model

if __name__ == "__main__":
    AUDIO_DIR = "crema_data"  # Folder containing CREMA-D WAV files
    BATCH_SIZE = 16
    NUM_EPOCHS = 20
    LEARNING_RATE = 0.001
    
    dataset = CREMADataset(audio_dir=AUDIO_DIR, sr=22050, duration=3, n_mfcc=40, hop_length=512)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=True)
    
    model = SimpleAudioCNN(num_classes=NUM_CLASSES)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("Using device:", device)
    
    trained_model = train_model(model, dataloader, criterion, optimizer, num_epochs=NUM_EPOCHS, device=device)
    
    model_file = "trained_crema_emotion_model.pkl"
    with open(model_file, "wb") as f:
        pickle.dump(trained_model.state_dict(), f)
    
    print(f"Model saved to {model_file}")
