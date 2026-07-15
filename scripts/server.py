"""
server.py
----------
Tiny Flask API that the Next.js frontend talks to.

Endpoints:
  POST /rebuild-index   -> rescans /photos, updates face-index.json
                            (body: {"force_all": true|false})
  POST /scan-face        -> accepts a webcam snapshot (base64 image),
                            returns list of matching photo filenames
  POST /upload-photos    -> accepts multiple uploaded image files,
                            saves them into /photos, and indexes new ones
  GET  /photos/<file>    -> serves an actual photo file to <img> tags
  GET  /health            -> simple check that the server is running

Run with:  python server.py
Runs on http://localhost:5000 by default (or Render's assigned PORT).
"""

import os
import re
import base64
import numpy as np
import cv2

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

from face_utils import get_face_embedding, is_match
from build_index import rebuild_index, load_index, PHOTOS_DIR

app = Flask(__name__)

# CORS setup:
# - localhost:3000 for local development
# - any *.vercel.app URL starting with "photo-studio" (covers production
#   AND every preview deployment Vercel auto-generates, so we don't have
#   to keep updating this every time the preview URL changes)
CORS(app, origins=[
    "http://localhost:3000",
    re.compile(r"https://photo-studio.*\.vercel\.app")
])


# ---- Helper: decode a base64 data URL (from webcam) into an OpenCV image --
def decode_base64_image(data_url):
    """
    Converts a 'data:image/jpeg;base64,...' string (sent from the browser
    webcam capture) into an OpenCV BGR image (numpy array).
    """
    header, encoded = data_url.split(",", 1)
    img_bytes = base64.b64decode(encoded)
    np_arr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    return img


# ---- Routes ---------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/rebuild-index", methods=["POST"])
def rebuild_index_route():
    """Rescans /photos and rebuilds face-index.json. Used by 'Rebuild Face Index' button."""
    body = request.get_json(silent=True) or {}
    force_all = body.get("force_all", False)

    index = rebuild_index(force_all=force_all)
    return jsonify({
        "status": "ok",
        "total_indexed_photos": len(index)
    })


@app.route("/upload-photos", methods=["POST"])
def upload_photos_route():
    """
    Receives multiple image files from the browser (a folder selected
    in the frontend), saves them into /photos, and indexes any new ones.
    """
    if not os.path.exists(PHOTOS_DIR):
        os.makedirs(PHOTOS_DIR)

    uploaded_files = request.files.getlist("photos")
    if not uploaded_files:
        return jsonify({"error": "No files received"}), 400

    saved_count = 0
    for file in uploaded_files:
        if file.filename == "":
            continue
        filename = secure_filename(os.path.basename(file.filename))
        if not filename.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".heic")):
            continue
        filepath = os.path.join(PHOTOS_DIR, filename)
        file.save(filepath)
        saved_count += 1

    # Index only the newly saved photos (existing ones are skipped automatically)
    index = rebuild_index(force_all=False)

    return jsonify({
        "status": "ok",
        "uploaded": saved_count,
        "total_indexed_photos": len(index)
    })


@app.route("/scan-face", methods=["POST"])
def scan_face_route():
    """
    Receives a webcam snapshot, finds its face embedding, and compares it
    against every embedding stored in face-index.json.

    Request body: { "image": "data:image/jpeg;base64,...." }
    Response: { "matches": ["photo1.jpg", "photo2.jpg", ...] }
    """
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

    # Compare the scanned face against every embedding of every stored photo
    for filename, data in index.items():
        for stored_embedding in data["embeddings"]:
            if is_match(scanned_embedding, stored_embedding):
                matches.append(filename)
                break  # no need to check other faces in same photo

    return jsonify({"matches": matches})


@app.route("/photos/<path:filename>", methods=["GET"])
def get_photo(filename):
    """Serves a photo file directly so the frontend <img src> can load it."""
    return send_from_directory(PHOTOS_DIR, filename)


if __name__ == "__main__":
    # Build the index on startup if it doesn't exist yet
    if not os.path.exists(os.path.join(os.path.dirname(PHOTOS_DIR), "face-index.json")):
        print("No existing index found. Building one now...")
        rebuild_index()

    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
