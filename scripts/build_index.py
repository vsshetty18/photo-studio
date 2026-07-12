"""
build_index.py
----------------
Scans the /photos folder, generates face embeddings for every image,
and stores them in face-index.json.

Smart behaviour:
- On first run: processes ALL images in /photos.
- On later runs: only processes NEW images (ones not already in the index).
- If a photo is deleted from /photos, its entry is removed from the index too.

Run directly:  python build_index.py
Or call rebuild_index() from server.py.
"""

import os
import json
import cv2
from face_utils import get_all_face_embeddings

# ---- Paths --------------------------------------------------------------
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
PHOTOS_DIR = os.path.join(PROJECT_ROOT, "photos")
INDEX_PATH = os.path.join(PROJECT_ROOT, "face-index.json")

VALID_EXTENSIONS = (".jpg", ".jpeg", ".png", ".webp")


def load_index():
    """Load existing face-index.json, or return an empty dict if none exists."""
    if os.path.exists(INDEX_PATH):
        with open(INDEX_PATH, "r") as f:
            return json.load(f)
    return {}


def save_index(index):
    """Write the index dict to face-index.json (pretty-printed for readability)."""
    with open(INDEX_PATH, "w") as f:
        json.dump(index, f, indent=2)


def rebuild_index(force_all=False):
    """
    Main entry point. Scans /photos and updates face-index.json.

    index format:
    {
      "customer1.jpg": {
        "embeddings": [[...512 floats...], [...another face if group photo...]]
      },
      ...
    }

    force_all=True re-processes every photo even if already indexed
    (used by the "Rebuild Face Index" button).
    """
    if not os.path.exists(PHOTOS_DIR):
        os.makedirs(PHOTOS_DIR)
        print(f"Created empty photos folder at {PHOTOS_DIR}. Add some images and rerun.")
        return {}

    index = {} if force_all else load_index()

    all_files = [
        f for f in os.listdir(PHOTOS_DIR)
        if f.lower().endswith(VALID_EXTENSIONS)
    ]

    # Remove entries for photos that no longer exist on disk
    for filename in list(index.keys()):
        if filename not in all_files:
            print(f"Removing deleted photo from index: {filename}")
            del index[filename]

    # Only process files not already indexed (unless force_all)
    new_files = [f for f in all_files if f not in index]

    if not new_files:
        print("No new photos to index. Index is up to date.")
        save_index(index)
        return index

    print(f"Indexing {len(new_files)} new photo(s)...")

    for filename in new_files:
        filepath = os.path.join(PHOTOS_DIR, filename)
        img = cv2.imread(filepath)
        if img is None:
            print(f"  Skipping unreadable file: {filename}")
            continue

        embeddings = get_all_face_embeddings(img)
        if not embeddings:
            print(f"  No face found in: {filename}")
            continue

        # Store as plain lists so it's JSON-serializable
        index[filename] = {
            "embeddings": [e.tolist() for e in embeddings]
        }
        print(f"  Indexed: {filename} ({len(embeddings)} face(s))")

    save_index(index)
    print(f"Done. face-index.json now has {len(index)} photo(s).")
    return index


if __name__ == "__main__":
    rebuild_index()
