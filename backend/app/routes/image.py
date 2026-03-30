from flask import Blueprint, request, jsonify, Response
import os
from werkzeug.utils import secure_filename
from helper.imageOCR import OCR as findTextFromImage
from textAnalyzer.apiCheck import main as apiCheck
from textAnalyzer.contextSegragator import main as contextSegragator
import uuid,json
import threading
import time
import cv2
from PIL import Image
from transformers import pipeline
classifier = pipeline("image-classification", model="NYUAD-ComNets/NYUAD_AI-generated_images_detector")

jobs={}
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
image_bp = Blueprint('image', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
def ocr(img):
  filename = img.filename
  file_path = os.path.join(UPLOAD_FOLDER, filename)
  img.save(file_path)
    
  # image = cv2.imread(filename=file_path)  
  output = findTextFromImage(file_path)
  os.remove(file_path)
  return output

@image_bp.route('/', methods=['POST'])
def get_image():
    job_id = str(uuid.uuid4())
    image = request.files['image']
    imageType = request.form.get('type')
    
    res=[]
    if(imageType == 'ai'):
      filename = image.filename
      file_path = os.path.join(UPLOAD_FOLDER, filename)
      image.save(file_path)
      image=Image.open(file_path)
      pred=classifier(image)
      os.remove(file_path)
      return jsonify(pred)
    else:
      text = ocr(image)
      print("text: ")
      print(text)
      lines = contextSegragator(text)
      lines = json.loads(lines)
      jobs[job_id] = {
          "results": [],
          "expected": len(lines)
      }
      def process():
          for line in lines:
              print(f"Processing line: {line}")
              curRes = apiCheck(line["news"], "en")
              print("apicheck result: ")
              print(curRes)
              jobs[job_id]["results"].append(curRes)
              # print(f"Appended result: {curRes}")

      threading.Thread(target=process).start()
      return jsonify({"job_id": job_id}) 


@image_bp.route('/stream/<job_id>', methods=['GET'])
def stream_results(job_id):
    def event_stream():
        last_len = 0
        while True:
            job = jobs.get(job_id, {})
            current = job.get("results", [])
            expected = job.get("expected", 0)

            print(f"SSE checking... {len(current)} / {expected}")

            if len(current) > last_len:
                # Send entire list so frontend can update progressively
                yield f"data: {json.dumps(current)}\n\n"
                last_len = len(current)

            if len(current) >= expected:
                print("SSE finished streaming.")
                break

            time.sleep(0.5)

    return Response(event_stream(), mimetype="text/event-stream")