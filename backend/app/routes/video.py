from flask import Blueprint, request, jsonify,Blueprint
import os
from werkzeug.utils import secure_filename
from mediaModel.modelApp import predict_video


video_bp = Blueprint('video', __name__)

VIDEO_UPLOAD_FOLDER = 'video_uploads'
os.makedirs(VIDEO_UPLOAD_FOLDER, exist_ok=True)

# Define confidence levels
def get_confidence_label(score):
    if score <= 20:
        return "Definitely Fake"
    elif score <= 40:
        return "Likely Fake"
    elif score <= 60:
        return "Uncertain"
    elif score <= 80:
        return "Likely Real"
    else:
        return "Definitely Real"

def isAIgen(video):
    confidence_score = round(predict_video(video)*100, 2)
    confidence_label = get_confidence_label(confidence_score)
    return ({"label": confidence_label, "probability": confidence_score})

@video_bp.route('/', methods=['POST'])
def get_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    
    video = request.files['video']
    option = request.form.get('option')  # User-selected option
    
    if video.filename == '':
        return jsonify({"error": "No selected video file"}), 400
    
    filename = secure_filename(video.filename)
    video_path = os.path.join(VIDEO_UPLOAD_FOLDER, filename)
    video.save(video_path)
    res = isAIgen(video_path)
    os.remove(video_path)
    return res
    # return jsonify({"message": "Video uploaded successfully", "video_path": video_path, "option": option})
