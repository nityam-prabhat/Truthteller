from flask import Blueprint, request, jsonify, Response
import os
from werkzeug.utils import secure_filename
import speech_recognition as sr
from textAnalyzer.apiCheck import main as apiCheck
from audioAnalyzer.audioExtract import main as getTextFromAudio
from audioAnalyzer.audioDownload import audio_online as downloadAudio
from textAnalyzer.contextSegragator import main as contextSegragator
import uuid,json
import threading
import time

audio_bp = Blueprint('audio', __name__)

AUDIO_UPLOAD_FOLDER = 'audio_uploads'
os.makedirs(AUDIO_UPLOAD_FOLDER, exist_ok=True)
jobs = {}

@audio_bp.route('/mic', methods=['POST'])
def get_audio_mic():
    job_id = str(uuid.uuid4())
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400
    
    audio = request.files['audio']
    option = request.form.get('option')  # User-selected option
    
    if audio.filename == '':
        return jsonify({"error": "No selected audio file"}), 400
    
    filename = secure_filename(audio.filename)
    audio_path = os.path.join(AUDIO_UPLOAD_FOLDER, filename)
    audio.save(audio_path)
    lines = getTextFromAudio(audio_path)
    lines = contextSegragator(lines)
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

@audio_bp.route('/url', methods=['POST'])
def get_audio_file():
    job_id = str(uuid.uuid4())
    data = request.get_json()
    print("data:",data)
    url = data["url"]
    print(url)
    audio_path = downloadAudio(url)
    lines = getTextFromAudio(audio_path)
    lines = contextSegragator(lines)
    print(lines)
    os.remove(audio_path)
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



@audio_bp.route('/stream/<job_id>', methods=['GET'])
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