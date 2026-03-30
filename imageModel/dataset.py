import tensorflow as tf
import numpy as np
import os

DATASET_PATH = "D:/Hackathon/Truthteller/imageModel/deepfake/Dataset"
categories = ["Fake", "Real"]  # Folder names must match

def load_images(split="Train"):
    image_paths, labels = [], []
    split_path = os.path.join(DATASET_PATH, split)  # train/ or test/
    
    for category in categories:
        path = os.path.join(split_path, category)  # train/real/ or train/fake/
        label = categories.index(category)
        
        for img_name in os.listdir(path)[:500]:
            img_path = os.path.join(path, img_name)
            image_paths.append(img_path)
            labels.append(label)
    
    return np.array(image_paths), np.array(labels)

def preprocess_image(img_path, label):
    img = tf.io.read_file(img_path)
    img = tf.image.decode_jpeg(img, channels=3)
    img = tf.image.resize(img, [224, 224])
    img = img / 255.0  # Normalize
    return img, label
