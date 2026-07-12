"use client";

/**
 * app/page.tsx
 * --------------
 * The main (and only) page of the app. Holds all the state and wires
 * together Toolbar, WebcamCapture, and PhotoGrid.
 *
 * Flow:
 *   1. "Load Photos" -> incrementally index any new photos in /photos
 *   2. "Scan Face"    -> open webcam -> capture -> send to backend -> get matches
 *   3. Click photos in the grid to select/deselect them
 *   4. "Print Selected" -> opens a print-friendly view -> browser print dialog
 *   5. "Rebuild Face Index" -> force re-processes every photo from scratch
 */

import { useState } from "react";
import Toolbar from "@/components/Toolbar";
import WebcamCapture from "@/components/WebcamCapture";
import PhotoGrid from "@/components/PhotoGrid";
import { rebuildIndex, scanFace, getPhotoUrl } from "@/lib/api";

export default function Home() {
  const [matches, setMatches] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showWebcam, setShowWebcam] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("");

  // ---- 📂 Load Photos: incremental index update ---------------------
  async function handleLoadPhotos() {
    setIsLoading(true);
    setStatusMessage("Scanning /photos for new images...");
    try {
      const result = await rebuildIndex(false);
      setStatusMessage(`Loaded. ${result.total_indexed_photos} photo(s) indexed in total.`);
    } catch (err) {
      setStatusMessage("Error loading photos. Is the Python server running?");
    } finally {
      setIsLoading(false);
    }
  }

  // ---- 🔄 Rebuild Face Index: force re-process everything -------------
  async function handleRebuildIndex() {
    setIsLoading(true);
    setStatusMessage("Rebuilding entire face index... this may take a while.");
    try {
      const result = await rebuildIndex(true);
      setStatusMessage(`Rebuilt. ${result.total_indexed_photos} photo(s) indexed.`);
    } catch (err) {
      setStatusMessage("Error rebuilding index. Is the Python server running?");
    } finally {
      setIsLoading(false);
    }
  }

  // ---- 📸 Scan Face: open webcam -------------------------------------
  function handleScanFace() {
    setShowWebcam(true);
    setStatusMessage("");
  }

  // Called by WebcamCapture once a frame has been captured
  async function handleCapture(imageDataUrl: string) {
    setShowWebcam(false);
    setIsLoading(true);
    setStatusMessage("Matching face against stored photos...");
    setSelected(new Set()); // clear old selection on a new scan

    try {
      const result = await scanFace(imageDataUrl);
      if (result.error) {
        setStatusMessage(result.error);
        setMatches([]);
      } else {
        setMatches(result.matches);
        setStatusMessage(
          result.matches.length > 0
            ? `Found ${result.matches.length} matching photo(s).`
            : "No matching photos found for this face."
        );
      }
    } catch (err) {
      setStatusMessage("Error scanning face. Is the Python server running?");
    } finally {
      setIsLoading(false);
    }
  }

  // ---- Grid selection toggle -------------------------------------------
  function handleToggleSelect(filename: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(filename)) {
        next.delete(filename);
      } else {
        next.add(filename);
      }
      return next;
    });
  }

  // ---- 🖨 Print Selected: open a print-friendly window ------------------
  function handlePrintSelected() {
    if (selected.size === 0) return;

    const imagesHtml = Array.from(selected)
      .map((filename) => `<img src="${getPhotoUrl(filename)}" class="print-photo" />`)
      .join("");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Photos</title>
          <style>
            body { margin: 0; padding: 16px; }
            .print-photo {
              width: 100%;
              max-width: 500px;
              display: block;
              margin: 0 auto 16px auto;
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${imagesHtml}
        </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for images to load before triggering print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }

  return (
    <main className="main-container">
      <h1 className="app-title">📷 Photo Studio — Face Search</h1>

      <Toolbar
        onLoadPhotos={handleLoadPhotos}
        onScanFace={handleScanFace}
        onPrintSelected={handlePrintSelected}
        onRebuildIndex={handleRebuildIndex}
        selectedCount={selected.size}
        isLoading={isLoading}
      />

      {statusMessage && <p className="status-message">{statusMessage}</p>}

      <PhotoGrid photos={matches} selected={selected} onToggle={handleToggleSelect} />

      {showWebcam && (
        <WebcamCapture onCapture={handleCapture} onClose={() => setShowWebcam(false)} />
      )}
    </main>
  );
}
