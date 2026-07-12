"""
server.py
----------
Tiny Flask API that the Next.js frontend talks to.
(Same as before, with two changes for deployment: dynamic PORT,
and CORS restricted to your frontend's domain.)
"""

import os
import base64
import numpy as np
import cv2

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from face_utils import get_face_embedding, is_match
from build_index import rebuild_index, load_index, PHOTOS_DIR

app = Flask(__name__)

# Only allow requests from your deployed frontend (replace with your real Vercel URL)
CORS(app, origins=[
    "http://localhost:3000",
    "https://photo-studio-yourname.vercel.app"
])


def decode_base64_image(data_url):
    header, encoded = data_url.split(",", 1)
    img_bytes = base64.b64decode(encoded)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/rebuild-index", methods=["POST"])
def rebuild_index_route():
    body = request.get_json(silent=True) or {}
    force_all = body.get("force_all", False)
    index = rebuild_index(force_all=force_all)
    return jsonify({"status": "ok", "total_indexed_photos": len(index)})


@app.route("/scan-face", methods=["POST"])
def scan_face_route():
    body = request.get_json(silent=True) or {}
    image_data = body.get("image")

    if not image_data:
        return jsonify({"error": "No image provided"}), 400

    img = decode_base64_image(image_data)
    if img is None:
        return jsonify({"error": "Could not decode image"}), 400

    scanned_embedding = get_face_embedding(img)
    if scanned_embedding is None:
        return jsonify({"error": "No face detected in scan. Try again."}), 200

    index = load_index()
    matches = []

    for filename, data in index.items():
        for stored_embedding in data["embeddings"]:
            if is_match(scanned_embedding, stored_embedding):
                matches.append(filename)
                break

    return jsonify({"matches": matches})


@app.route("/photos/<path:filename>", methods=["GET"])
def get_photo(filename):
    return send_from_directory(PHOTOS_DIR, filename)


if __name__ == "__main__":
    if not os.path.exists(os.path.join(os.path.dirname(PHOTOS_DIR), "face-index.json")):
        print("No existing index found. Building one now...")
        rebuild_index()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
