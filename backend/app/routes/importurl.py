from flask import Blueprint, request, jsonify
from app.url_parser import scrape_and_write_paragraphs
bp = Blueprint('importurl', __name__, url_prefix='/api/url')


# New API route for /url
@bp.route('/', methods=['GET'])
def get_url():
    # print(request)
    data = request.args.get('url')
    print(data)
    if not data:
      return jsonify({"error": "No data provided"}), 400
    data = scrape_and_write_paragraphs(data)
    print(data)
    with open('../filte.txt', 'w') as f:
      for item in data:
        f.write(f"{item}\n")
    headers = {
        'Content-Type': '',
        'User-Agent': 'Thunder Client ',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'no-cache'
    }
    return jsonify({"messages": "success"}), 200
