"""
face_utils.py
--------------
Core face recognition helpers used by build_index.py and server.py.

Uses InsightFace (buffalo_l model) to:
1. Detect faces in an image
2. Generate a 512-dim embedding (a "fingerprint") for each face
3. Compare embeddings using cosine similarity to decide if two faces match

Keep this file dependency-light — everything else imports from here.
"""

import cv2
import numpy as np
from insightface.app import FaceAnalysis

# ---- Model setup -----------------------------------------------------
# Loaded once and reused everywhere (loading the model is slow, ~2-5s).
# ctx_id=-1 forces CPU (safe default for a college laptop with no GPU).
_face_app = None


def get_face_app():
    """Lazily load and cache the InsightFace model."""
    global _face_app
    if _face_app is None:
        _face_app = FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
        _face_app.prepare(ctx_id=-1, det_size=(640, 640))
    return _face_app


# ---- Embedding extraction ---------------------------------------------
def get_face_embedding(image_path_or_array):
    """
    Given an image (file path OR a numpy array from webcam), return the
    embedding of the FIRST/LARGEST face found, or None if no face detected.

    Returns: numpy array of shape (512,) or None
    """
    app = get_face_app()

    if isinstance(image_path_or_array, str):
        img = cv2.imread(image_path_or_array)
        if img is None:
            return None
    else:
        img = image_path_or_array

    faces = app.get(img)
    if len(faces) == 0:
        return None

    largest_face = max(faces, key=lambda f: (f.bbox[2] - f.bbox[0]) * (f.bbox[3] - f.bbox[1]))
    return largest_face.embedding  # 512-dim float32 vector


def get_all_face_embeddings(image_path_or_array):
    """
    Same as above, but returns embeddings for ALL faces found in the image.
    Useful for group photos in the /photos folder.
    """
    app = get_face_app()

    if isinstance(image_path_or_array, str):
        img = cv2.imread(image_path_or_array)
        if img is None:
            return []
    else:
        img = image_path_or_array

    faces = app.get(img)
    return [f.embedding for f in faces]


# ---- Comparison ---------------------------------------------------------
def cosine_similarity(embedding_a, embedding_b):
    """
    Standard cosine similarity between two embeddings.
    Returns a value between -1 and 1 (1 = identical direction/very similar face).
    """
    a = np.array(embedding_a)
    b = np.array(embedding_b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


# Threshold above which we consider two faces "the same person".
MATCH_THRESHOLD = 0.38


def is_match(embedding_a, embedding_b, threshold=MATCH_THRESHOLD):
    """Simple boolean helper: do these two faces belong to the same person?"""
    return cosine_similarity(embedding_a, embedding_b) >= threshold
