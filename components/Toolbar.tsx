"use client";

/**
 * components/Toolbar.tsx
 * -------------------------
 * The 4 main action buttons for the app:
 *   📂 Load Photos        - rescans /photos for new images (quick, incremental)
 *   📸 Scan Face           - opens webcam to scan a customer's face
 *   🖨 Print Selected      - sends selected photos to the print dialog
 *   🔄 Rebuild Face Index  - force re-processes ALL photos from scratch
 *
 * Kept as one component since it's just a row of buttons calling
 * functions passed down from page.tsx.
 */

interface ToolbarProps {
  onLoadPhotos: () => void;
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
  return (
    <div className="toolbar">
      <button onClick={onLoadPhotos} disabled={isLoading} className="btn btn-primary">
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
