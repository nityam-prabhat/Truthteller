from flask import Blueprint, request, jsonify, Response, Flask
import uuid
import time
import threading
import json
from textAnalyzer.apiCheck import main as apiCheck
from textAnalyzer.contextSegragator import main as segragateContext
from textAnalyzer.urlParser import main as parse_url

text_bp = Blueprint('text', __name__)
jobs = {}

@text_bp.route('/', methods=['POST'])
def add_text():
    data = request.get_json()
    job_id = str(uuid.uuid4())
    # to-do call context segragator which provide list of lines
    lines = []
    if data["textType"] == "manual":
        lines = segragateContext(data["text"])
        lines = json.loads(lines)
    else:
        lines.append(data["text"].strip().replace('\n',''))
    # lines = data["text"].strip().split("\n")
    jobs[job_id] = {
        "results": [],
        "expected": len(lines)
    }

    def process():
        for line in lines:
            print(f"Processing line: {line}")
            if data['textType'] == "manual":
                # print(line)
                curRes = apiCheck(line["news"], line["language"])
                print("apicheck result: ")
                print(curRes)
            else:
                heading = parse_url(line)
                print("heading", heading)
                heading = segragateContext(heading)
                heading = (json.loads(heading))[0]
                print("heading1", heading)
                curRes = apiCheck(heading["news"], heading["language"])
                print("url text output:")
                print(curRes)
            jobs[job_id]["results"].append(curRes)
            # print(f"Appended result: {curRes}")

    threading.Thread(target=process).start()
    return jsonify({"job_id": job_id})

@text_bp.route('/stream/<job_id>', methods=['GET'])
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