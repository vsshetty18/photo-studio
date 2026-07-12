/**
 * lib/api.ts
 * -----------
 * Small helper functions that call the local Flask backend (localhost:5000).
 * Keeping all fetch() calls here means page.tsx stays clean and readable.
 */

const API_BASE = "http://localhost:5000";

/**
 * Tells the backend to rescan /photos and rebuild face-index.json.
 * force_all = true reprocesses every photo (used by "Rebuild Face Index" button).
 * force_all = false only processes new photos (used automatically on "Load Photos").
 */
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

/**
 * Sends a captured webcam frame (base64 JPEG data URL) to the backend,
 * gets back a list of matching photo filenames.
 */
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

/**
 * Builds the full URL for a given photo filename so it can be used
 * directly in an <img src="..."> tag.
 */
export function getPhotoUrl(filename: string): string {
  return `${API_BASE}/photos/${encodeURIComponent(filename)}`;
}
