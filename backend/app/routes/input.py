from flask import Blueprint, jsonify

# Define the Blueprint for 'input' API
bp = Blueprint('input', __name__, url_prefix='/api/input')

# New API route for /input
@bp.route('/', methods=['GET'])
def get_kafka_messages():
    with open('../filte.txt', "r") as file:
        # Read all lines into a list
        lines = file.readlines()

        cleaned_lines = [line.strip() for line in lines]
        # print(cleaned_lines)
    return jsonify({"messages": cleaned_lines}), 200
