from flask import request, jsonify, Blueprint
import os
from werkzeug.utils import secure_filename
# from mediaModel.modelApp import predict_video

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

bp = Blueprint('analyze', __name__,url_prefix='/api/analyze')

# Define confidence levels
def get_confidence_label(score):
    if score <= 0.2:
        return "Definitely Fake"
    elif score <= 0.4:
        return "Likely Fake"
    elif score <= 0.6:
        return "Uncertain"
    elif score <= 0.8:
        return "Likely Real"
    else:
        return "Definitely Real"

@bp.route("/", methods=["POST"])
def analyze_media():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    
    # Get confidence score from the model
    confidence_score = predict_video(file_path)
    confidence_label = get_confidence_label(confidence_score)
    
    # Remove the uploaded file after processing
    os.remove(file_path)
    
    return jsonify({
        "confidence_score": confidence_score,
        "message": confidence_label
    })