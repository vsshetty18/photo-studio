"use client";

/**
 * components/Toolbar.tsx
 * -------------------------
 * The 4 main action buttons:
 *   📂 Load Photos        - opens a folder picker, uploads photos to backend
 *   📸 Scan Face           - opens webcam to scan a customer's face
 *   🖨 Print Selected      - sends selected photos to the print dialog
 *   🔄 Rebuild Face Index  - force re-processes ALL photos from scratch
 */

import { useRef } from "react";

interface ToolbarProps {
  onLoadPhotos: (files: FileList) => void;
  onScanFace: () => void;
  onPrintSelected: () => void;
  onRebuildIndex: () => void;
  selectedCount: number;
  isLoading: boolean;
}

export default function Toolbar({
  onLoadPhotos,
  onScanFace,
  onPrintSelected,
  onRebuildIndex,
  selectedCount,
  isLoading,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleLoadClick() {
    fileInputRef.current?.click();
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onLoadPhotos(e.target.files);
    }
    e.target.value = ""; // reset so picking the same folder again still works
  }

  return (
    <div className="toolbar">
      {/* Hidden input - webkitdirectory lets the user pick a whole folder (Chrome/Edge) */}
      <input
        ref={fileInputRef}
        type="file"
        // @ts-ignore - webkitdirectory is non-standard but works in Chrome/Edge
        webkitdirectory="true"
        multiple
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFilesSelected}
      />

      <button onClick={handleLoadClick} disabled={isLoading} className="btn btn-primary">
        📂 Load Photos
      </button>

      <button onClick={onScanFace} disabled={isLoading} className="btn btn-primary">
        📸 Scan Face
      </button>

      <button
        onClick={onPrintSelected}
        disabled={isLoading || selectedCount === 0}
        className="btn btn-primary"
      >
        🖨 Print Selected {selectedCount > 0 ? `(${selectedCount})` : ""}
      </button>

      <button onClick={onRebuildIndex} disabled={isLoading} className="btn btn-secondary">
        🔄 Rebuild Face Index
      </button>
    </div>
  );
}
