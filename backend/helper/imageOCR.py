import cv2
import numpy as np
import pytesseract
import re

def ocr_core(img):
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(img, config=custom_config)
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    return text

# Get greyscale image
def get_greyscale(image):
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Invert image colors
def invert_colors(image):
    return cv2.bitwise_not(image)

# Histogram equalization
def equalize_histogram(image):
    return cv2.equalizeHist(image)

# Otsu's thresholding
def otsu_thresholding(image):
    _, thresh = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return thresh

# Noise removal with bilateral filter
def remove_noise(image):
    return cv2.bilateralFilter(image, 9, 75, 75)

# Dilation
def dilate(image):
    kernel = np.ones((1, 1), np.uint8)
    return cv2.dilate(image, kernel, iterations=1)

# Erosion
def erode(image):
    kernel = np.ones((1, 1), np.uint8)
    return cv2.erode(image, kernel, iterations=1)

# Resize image
def resize_image(image, scale_percent):
    width = int(image.shape[1] * scale_percent / 100)
    height = int(image.shape[0] * scale_percent / 100)
    return cv2.resize(image, (width, height), interpolation=cv2.INTER_AREA)

def OCR(file_path):
    img = cv2.imread(file_path)
    img = get_greyscale(img)
    img = resize_image(img, 150)
    img = equalize_histogram(img)

    # Try both normal and inverted images
    normal_img = otsu_thresholding(img)
    inverted_img = otsu_thresholding(invert_colors(img))

    # Use the image with better OCR results
    text_normal = ocr_core(normal_img)
    text_inverted = ocr_core(inverted_img)

    # Choose the text with more characters (as a simple heuristic)
    final_text = text_normal if len(text_normal) > len(text_inverted) else text_inverted
    print(final_text)
    return final_text