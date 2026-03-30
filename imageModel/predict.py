import tensorflow as tf
from tensorflow.keras.models import load_model

# Load the trained model
model = load_model("D:/Hackathon/Truthteller/imageModel/cnn_model.h5")

# Function to preprocess a single image
def preprocess_single_image(img_path):
    img = tf.io.read_file(img_path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, [128, 128])
    img = img / 255.0  # Normalize
    img = tf.expand_dims(img, axis=0)  # Add batch dimension
    return img

# Function to predict an image
def predict_image(img_path):
    img = preprocess_single_image(img_path)
    prediction = model.predict(img)[0][0]

    if prediction > 0.5:
        print(f"🟢 AI-Generated Image ({prediction:.4f})")
    else:
        print(f"🔵 Real Image ({prediction:.4f})")

# Test prediction
predict_image("D:/Hackathon/Truthteller/imageModel/deepfake/Dataset/Test/Real/real_1000.jpg")
