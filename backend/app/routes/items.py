from flask import Blueprint, jsonify
import json
import os
# Blueprint for item-related routes
bp = Blueprint('items', __name__, url_prefix='/api/items')

# Define the path to the JSON database
DATABASE_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..\data', 'database.json')

@bp.route('/', methods=['GET'])
def get_items():
    try:
        with open(DATABASE_FILE, 'r') as f:
            data = json.load(f)
            return jsonify(data['news']), 200
    except FileNotFoundError:
        return jsonify({"error": "Database file not found"}), 500
    except KeyError:
        return jsonify({"error": "Invalid database structure"}), 500
