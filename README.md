# 📷 Photo Studio — AI Face Search

A simple tool for photo studios: scan a customer's face with your webcam,
and instantly find every photo of them in your local `/photos` folder for
printing. No database, no cloud, no logins — everything runs locally.

---

## How it works

1. Drop customer photos into the `/photos` folder (any filenames, `.jpg` / `.jpeg` / `.png` / `.webp`).
2. Click **📂 Load Photos** — this scans `/photos`, generates a face
   "fingerprint" (embedding) for each new photo using InsightFace, and
   saves them to `face-index.json`. Already-indexed photos are skipped,
   so this is fast after the first run.
3. Click **📸 Scan Face** — your webcam opens, capture the customer's face.
4. The app compares the scanned face against every stored embedding and
   shows all matching photos in a grid.
5. Click photos to select them (blue border = selected).
6. Click **🖨 Print Selected** — opens your browser's print dialog with
   just the selected photos.
7. If you add a lot of new photos or change the matching threshold, use
   **🔄 Rebuild Face Index** to reprocess everything from scratch.

---

## Project structure
