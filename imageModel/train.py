from dataset import load_images, preprocess_image
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.utils.class_weight import compute_class_weight
import numpy as np

# Load train and test dataset
X_train, y_train = load_images("Train")  # Use train folder
X_test, y_test = load_images("Test")    # Use test folder

# Create TensorFlow datasets
train_dataset = tf.data.Dataset.from_tensor_slices((X_train, y_train)).map(preprocess_image).batch(32).prefetch(tf.data.experimental.AUTOTUNE)
test_dataset = tf.data.Dataset.from_tensor_slices((X_test, y_test)).map(preprocess_image).batch(32).prefetch(tf.data.experimental.AUTOTUNE)

# Compute class weights (for handling imbalance)
class_weights = compute_class_weight("balanced", classes=np.unique(y_train), y=y_train)
class_weights = {i: weight for i, weight in enumerate(class_weights)}

# ✅ Data Augmentation Layer
data_augmentation = keras.Sequential([
    layers.RandomFlip("horizontal"),
    layers.RandomRotation(0.2),
    layers.RandomZoom(0.1),
    layers.RandomContrast(0.1),
])

# Define EfficientNet Model
base_model = keras.applications.EfficientNetB0(weights="imagenet", include_top=False, input_shape=(224, 224, 3))
base_model.trainable = True  # Unfreeze some layers for fine-tuning

for layer in base_model.layers[:100]:  
    layer.trainable = False  # Freeze first 100 layers

# ✅ Updated Model with Data Augmentation
model = keras.Sequential([
    data_augmentation,  # <--- Augmentation added here
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    layers.Dense(128, activation="relu"),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    layers.Dense(1, activation="sigmoid")  # Binary classification
])

# Compile and Train Model
optimizer = keras.optimizers.Adam(learning_rate=0.001)
model.compile(optimizer=optimizer, loss="binary_crossentropy", metrics=["accuracy"])
history = model.fit(train_dataset, epochs=15, validation_data=test_dataset, class_weight=class_weights)

# Save the Model
model.save("D:/Hackathon/Truthteller/imageModel/saved_model.keras")
print("✅ Model saved successfully!")

# Evaluate Model
test_loss, test_acc = model.evaluate(test_dataset)
print(f"Final Test Accuracy: {test_acc:.4f}")
