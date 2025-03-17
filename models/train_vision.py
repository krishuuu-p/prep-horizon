import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, RandomSampler
from torchvision import datasets, transforms
from tqdm import tqdm
import pickle
from collections import Counter

# Preprocessing: resize, grayscale, tensor, normalize.
transform = transforms.Compose([
    transforms.Resize((48, 48)),
    transforms.Grayscale(num_output_channels=1),
    transforms.ToTensor(),
    transforms.Normalize((0.5,), (0.5,))
])

# Dataset arranged as fer2013_data/Training/<emotion>/
DATA_DIR = "/kaggle/input/fer2013/train"
dataset = datasets.ImageFolder(root=DATA_DIR, transform=transform)
# Count instances per class
class_counts = Counter(dataset.targets)
print("Instances per class:", dict(class_counts))
print("Classes:", dataset.classes)

# Use RandomSampler for perfect shuffling
sampler = RandomSampler(dataset)
dataloader = DataLoader(dataset, batch_size=128, sampler=sampler, num_workers=2)
NUM_CLASSES = len(dataset.classes)

class SimpleFERCNN(nn.Module):
    def __init__(self, num_classes):
        super(SimpleFERCNN, self).__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, kernel_size=3, padding=1),  # (32,48,48)
            nn.ReLU(),
            nn.MaxPool2d(2),                           # (32,24,24)
            nn.Conv2d(32, 64, kernel_size=3, padding=1), # (64,24,24)
            nn.ReLU(),
            nn.MaxPool2d(2),                           # (64,12,12)
            nn.Conv2d(64, 128, kernel_size=3, padding=1),# (128,12,12)
            nn.ReLU(),
            nn.MaxPool2d(2)                            # (128,6,6)
        )
        self.classifier = nn.Sequential(
            nn.Linear(128 * 6 * 6, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )
    def forward(self, x):
        x = self.features(x)
        x = x.view(x.size(0), -1)
        return self.classifier(x)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = SimpleFERCNN(num_classes=NUM_CLASSES).to(device)
criterion = nn.CrossEntropyLoss()
optimizer = optim.Adam(model.parameters(), lr=0.001)

def train_model(model, dataloader, criterion, optimizer, num_epochs, device):
    model.train()
    for epoch in range(num_epochs):
        running_loss, correct, total = 0.0, 0, 0
        progress_bar = tqdm(dataloader, desc=f"Epoch {epoch+1}/{num_epochs}", leave=False)
        for images, labels in progress_bar:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item() * images.size(0)
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            progress_bar.set_postfix(loss=loss.item())
        print(f"Epoch {epoch+1}/{num_epochs} - Loss: {running_loss/total:.4f}, Accuracy: {correct/total:.4f}")
    return model

NUM_EPOCHS = 30
trained_model = train_model(model, dataloader, criterion, optimizer, num_epochs=NUM_EPOCHS, device=device)

model_file = "trained_fer_model.pkl"
with open(model_file, "wb") as f:
    pickle.dump(trained_model.state_dict(), f)
print(f"Model saved to {model_file}")
