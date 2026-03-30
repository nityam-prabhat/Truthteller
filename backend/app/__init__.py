from flask import Flask, request, abort
from app.routes import image, audio, text
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config['MAX_CONTENT_LENGTH'] = 300 * 1024 * 1024  # 300MB
    # CORS(app)
    # CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"], "methods": ["GET", "POST"]}})
    #    CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})  # Allow all routes from this origin
    CORS(app, resources={r"/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST","OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization","User-Agent","Accept-Encoding"]
    }})
    app.config.from_object('app.config.Config')  # Load configuration
    # app.register_blueprint(items)
    # app.register_blueprint(input)
    # app.register_blueprint(importurl)
    app.register_blueprint(text, url_prefix='/text')
    app.register_blueprint(image, url_prefix='/image')
    app.register_blueprint(audio, url_prefix='/audio')
    # app.register_blueprint(video, url_prefix='/video')

    return app