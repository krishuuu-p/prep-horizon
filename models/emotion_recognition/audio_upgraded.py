import time
import numpy as np
import torch
import torch.nn.functional as F
import librosa
import pyaudio
from collections import deque
import threading

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

MODEL_TS_PATH = "complex_audio_emotion_model_ts.pt"  
model = torch.jit.load(MODEL_TS_PATH, map_location=device)
model.eval()

idx_to_emotion = {
    0: "angry",
    1: "calm",
    2: "happy",
    3: "sad",
    4: "fearful",
    5: "disgust",
    6: "surprised",
    7: "neutral"
}

base_nervousness = {
    "angry": 80,
    "fearful": 90,
    "disgust": 70,
    "sad": 60,
    "surprised": 55,
    "happy": 20,
    "neutral": 40,
    "calm": 30
}

def compute_nervousness(predicted_emotion, f0_std):
    """
    Computes a nervousness score (0-100) using:
      - A base score defined by the predicted emotion.
      - An adjustment based on the standard deviation of the fundamental frequency (f0_std):
            f0_std < 20 Hz: +0,
            20 Hz <= f0_std < 50 Hz: +10,
            f0_std >= 50 Hz: +20.
    """
    base_score = base_nervousness.get(predicted_emotion, 40)
    if f0_std < 20:
        adjustment = 0
    elif f0_std < 50:
        adjustment = 10
    else:
        adjustment = 20
    final_score = base_score + adjustment
    return np.clip(final_score, 0, 100)

AUDIO_RATE = 16000  # Sampling rate (Hz)
CHUNK = 1024       # Number of samples per frame
audio_buffer = deque(maxlen=AUDIO_RATE)  # 1-second buffer
buffer_lock = threading.Lock()

def audio_callback(in_data, frame_count, time_info, status):
    data = np.frombuffer(in_data, dtype=np.int16).astype(np.float32) / 32768.0
    with buffer_lock:
        audio_buffer.extend(data.tolist())
    return (in_data, pyaudio.paContinue)

def start_audio_stream():
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paInt16,
                    channels=1,
                    rate=AUDIO_RATE,
                    input=True,
                    frames_per_buffer=CHUNK,
                    stream_callback=audio_callback)
    stream.start_stream()
    return p, stream

def real_time_inference(update_threshold=5.0, smoothing_window=5):
    """
    Captures 1-second audio windows from the microphone and computes:
      - The predicted emotion from the transformer-based classifier.
      - The nervousness score based on the predicted emotion and pitch variability.
    The output is smoothed over a sliding window and only updated when a significant change occurs.
    """
    p, stream = start_audio_stream()
    print("Real-time inference started. Press Ctrl+C to stop.")
    
    recent_scores = deque(maxlen=smoothing_window)
    last_emotion = None
    last_nervousness = None

    try:
        while True:
            time.sleep(1)  # Process every second
            with buffer_lock:
                if len(audio_buffer) < AUDIO_RATE:
                    continue  # Wait until we have 1 second of audio
                current_audio = np.array(list(audio_buffer))[:AUDIO_RATE]
            # Prepare input tensor [1, num_samples]
            audio_tensor = torch.tensor(current_audio, dtype=torch.float32).unsqueeze(0).to(device)
            
            # Run inference on audio through the model
            with torch.no_grad():
                logits, _ = model(audio_tensor)
                probs = F.softmax(logits, dim=1)
                pred_idx = torch.argmax(probs, dim=1).item()
            predicted_emotion = idx_to_emotion.get(pred_idx, "neutral")
            
            # Compute fundamental frequency using librosa.pyin
            f0, _, _ = librosa.pyin(current_audio, fmin=librosa.note_to_hz('C2'),
                                    fmax=librosa.note_to_hz('C7'))
            f0 = f0[~np.isnan(f0)]
            f0_std = np.std(f0) if len(f0) > 0 else 0.0
            
            # Compute nervousness score
            current_score = compute_nervousness(predicted_emotion, f0_std)
            recent_scores.append(current_score)
            smoothed_score = np.mean(recent_scores)
            
            # Update output if emotion changes or if nervousness change exceeds threshold
            if (last_emotion != predicted_emotion) or (last_nervousness is None or abs(smoothed_score - last_nervousness) >= update_threshold):
                print(f"Emotion: {predicted_emotion} | Nervousness: {smoothed_score:.1f}/100")
                last_emotion = predicted_emotion
                last_nervousness = smoothed_score

    except KeyboardInterrupt:
        print("Real-time inference stopped.")
    finally:
        stream.stop_stream()
        stream.close()
        p.terminate()

if __name__ == "__main__":
    real_time_inference()
