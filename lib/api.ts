/**
 * lib/api.ts
 * -----------
 * Small helper functions that call the Flask backend.
 * API_BASE comes from an environment variable so it works both
 * locally (localhost:5000) and when deployed (your Render URL).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function rebuildIndex(forceAll: boolean = false): Promise<{ total_indexed_photos: number }> {
  const res = await fetch(`${API_BASE}/rebuild-index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ force_all: forceAll }),
  });

  if (!res.ok) {
    throw new Error("Failed to rebuild index");
  }

  return res.json();
}

export async function scanFace(imageDataUrl: string): Promise<{ matches: string[]; error?: string }> {
  const res = await fetch(`${API_BASE}/scan-face`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: imageDataUrl }),
  });

  if (!res.ok) {
    throw new Error("Failed to scan face");
  }

  return res.json();
}

export function getPhotoUrl(filename: string): string {
  return `${API_BASE}/photos/${encodeURIComponent(filename)}`;
}
/**
 * Uploads a folder of photos selected in the browser to the backend,
 * which saves them into /photos and indexes them.
 */
export async function uploadPhotos(files: FileList): Promise<{ uploaded: number; total_indexed_photos: number }> {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("photos", file);
  });

  const res = await fetch(`${API_BASE}/upload-photos`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload photos");
  }

  return res.json();
}
