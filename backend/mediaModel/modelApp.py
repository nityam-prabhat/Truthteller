from tensorflow import keras
import numpy as np
import cv2
import os

# Load the saved model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "deepfakeModel.keras")
loaded_model = keras.models.load_model(MODEL_PATH)

def predict_video(video_path, frame_skip=30):
    # Open the video file specified by `video_path`
    cap = cv2.VideoCapture(video_path)
    
    # Initialize counters for frames
    frame_count = 0
    deepfake_frames = 0  # Counter for frames predicted as deepfake
    total_frames = 0     # Counter for total processed frames

    # Loop through the video frames
    while cap.isOpened():
        # Read the next frame from the video
        ret, frame = cap.read()
        
        # If no frame is returned, end of video is reached
        if not ret:
            break

        # Process every `frame_skip` frames to reduce computation
        if frame_count % frame_skip == 0:
            # Resize the frame to 128x128 pixels to match the input size of the model
            img = cv2.resize(frame, (128, 128))
            
            # Normalize pixel values to the range [0, 1]
            img = img / 255.0
            
            # Expand dimensions to match the model's input shape (batch size of 1)
            img = np.expand_dims(img, axis=0)
            
            # Predict using the model
            prediction = loaded_model.predict(img)
            
            # If the prediction is greater than 0.5, classify the frame as a deepfake
            if prediction > 0.5:
                deepfake_frames += 1
            
            # Increment the total processed frames counter
            total_frames += 1

        # Increment the frame count
        frame_count += 1

    # Release the video capture object
    cap.release()

    # Calculate the ratio of frames predicted as deepfake
    deepfake_ratio = deepfake_frames / total_frames
    print(f'The confidence score is: {1.00-deepfake_ratio}')
    return 1.00-deepfake_ratio

# result = predict_video(loaded_model,'D:/Hackathon/Truthteller/mediaModel/01__kitchen_pan.mp4' )
# print(f'The video is: {result}')