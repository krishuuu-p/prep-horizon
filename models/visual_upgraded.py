import cv2
import time
import numpy as np
import torch
import torch.nn.functional as F
import mediapipe as mp
from torchvision import transforms
from collections import deque
from PIL import Image  # Added missing import

# Device configuration
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

####################################
# Load Pretrained TorchScript Visual Model
####################################
MODEL_TS_PATH = "complex_visual_emotion_model_ts.pt"  # Ensure this file is in your working directory
model = torch.jit.load(MODEL_TS_PATH, map_location=device)
model.eval()

####################################
# Inverse Label Mapping (should match training)
####################################
# For example, if you trained with FER2013 (7 classes):
idx_to_emotion = {
    0: "angry",
    1: "disgust",
    2: "fear",
    3: "happy",
    4: "sad",
    5: "surprise",
    6: "neutral"
}

####################################
# Hardcoded Nervousness Mapping for Visual Cues
####################################
# Base nervousness scores for each emotion (values based on literature)
base_nervousness = {
    "angry": 80,
    "fear": 90,
    "disgust": 70,
    "sad": 60,
    "surprise": 55,
    "happy": 20,
    "neutral": 40
}

def compute_nervousness_visual(predicted_emotion, furrow_intensity):
    """
    Computes a nervousness score (0-100) using:
      - A base score for the predicted emotion.
      - An adjustment based on eyebrow furrow intensity (normalized 0-1).
    For example:
        furrow_intensity < 0.3: adjustment = 0,
        0.3 <= furrow_intensity < 0.6: adjustment = +10,
        furrow_intensity >= 0.6: adjustment = +20.
    """
    base_score = base_nervousness.get(predicted_emotion, 40)
    if furrow_intensity < 0.3:
        adjustment = 0
    elif furrow_intensity < 0.6:
        adjustment = 10
    else:
        adjustment = 20
    final_score = base_score + adjustment
    return np.clip(final_score, 0, 100)

####################################
# Set Up Image Preprocessing for Face Crop
####################################
preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

####################################
# Set Up MediaPipe Face Mesh
####################################
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(static_image_mode=False,
                                  max_num_faces=1,
                                  refine_landmarks=True,
                                  min_detection_confidence=0.5,
                                  min_tracking_confidence=0.5)

####################################
# Compute Eyebrow Furrow Intensity
####################################
def extract_eyebrow_furrow_intensity(image, landmarks):
    """
    Computes a proxy for eyebrow furrow intensity by measuring the Euclidean distance
    between the inner corners of the eyebrows (landmark indices 70 and 300).
    The distance is then normalized such that:
      - Distance >= 50 pixels -> intensity = 0.0 (no furrow)
      - Distance <= 40 pixels -> intensity = 1.0 (max furrow)
      - Otherwise, linearly interpolated.
    """
    h, w, _ = image.shape
    try:
        left_inner = landmarks.landmark[70]
        right_inner = landmarks.landmark[300]
    except IndexError:
        return 0.0
    x_left, y_left = int(left_inner.x * w), int(left_inner.y * h)
    x_right, y_right = int(right_inner.x * w), int(right_inner.y * h)
    distance = np.sqrt((x_right - x_left)**2 + (y_right - y_left)**2)
    
    max_distance = 50.0
    min_distance = 40.0
    if distance >= max_distance:
        intensity = 0.0
    elif distance <= min_distance:
        intensity = 1.0
    else:
        intensity = (max_distance - distance) / (max_distance - min_distance)
    return intensity

####################################
# Real-Time Visual Inference Function
####################################
def real_time_visual_inference(update_threshold=5.0, smoothing_window=5):
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not open webcam.")
        return
    
    recent_scores = deque(maxlen=smoothing_window)
    last_emotion = None
    last_nervousness = None

    print("Real-time visual inference started. Press 'q' to quit.")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            continue
        
        # Flip frame for mirror effect and convert BGR to RGB
        frame = cv2.flip(frame, 1)
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # Process the frame with MediaPipe Face Mesh
        results = face_mesh.process(rgb_frame)
        
        display_text = "No face detected"
        if results.multi_face_landmarks:
            landmarks = results.multi_face_landmarks[0]
            
            # Compute bounding box around the face
            h, w, _ = frame.shape
            pts = np.array([(int(lm.x * w), int(lm.y * h)) for lm in landmarks.landmark])
            x, y, w_box, h_box = cv2.boundingRect(pts)
            face_crop = frame[y:y+h_box, x:x+w_box]
            
            # Preprocess the face crop
            try:
                face_img = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)
                face_img = cv2.resize(face_img, (224, 224))
            except Exception as e:
                face_img = cv2.resize(frame, (224, 224))
            face_tensor = preprocess(Image.fromarray(face_img)).unsqueeze(0).to(device)
            
            # Run the visual emotion model
            with torch.no_grad():
                logits = model(face_tensor)
                probs = F.softmax(logits, dim=1)
                pred_idx = torch.argmax(probs, dim=1).item()
            predicted_emotion = idx_to_emotion.get(pred_idx, "neutral")
            
            # Extract eyebrow furrow intensity
            furrow_intensity = extract_eyebrow_furrow_intensity(frame, landmarks)
            current_score = compute_nervousness_visual(predicted_emotion, furrow_intensity)
            recent_scores.append(current_score)
            smoothed_score = np.mean(recent_scores)
            
            display_text = f"Emotion: {predicted_emotion} | Nervousness: {smoothed_score:.1f}/100"
            last_emotion = predicted_emotion
            last_nervousness = smoothed_score
            
            # Draw face bounding box
            cv2.rectangle(frame, (x, y), (x+w_box, y+h_box), (0, 255, 0), 2)
        
        # Overlay display text on the frame
        cv2.putText(frame, display_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1,
                    (0, 255, 0) if "No face" not in display_text else (0, 0, 255), 2)
        cv2.imshow("Real-Time Visual Emotion & Nervousness", frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    real_time_visual_inference()
