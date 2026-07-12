"use client";

/**
 * components/PhotoGrid.tsx
 * --------------------------
 * Displays matching photos as large thumbnails in a responsive grid.
 * Clicking a photo toggles its selection (shown with a blue border).
 *
 * Usage:
 *   <PhotoGrid
 *     photos={["a.jpg", "b.jpg"]}
 *     selected={selectedSet}
 *     onToggle={(filename) => ...}
 *   />
 */

import { getPhotoUrl } from "@/lib/api";

interface PhotoGridProps {
  photos: string[];
  selected: Set<string>;
  onToggle: (filename: string) => void;
}

export default function PhotoGrid({ photos, selected, onToggle }: PhotoGridProps) {
  if (photos.length === 0) {
    return <p className="empty-message">No matching photos yet. Try scanning a face.</p>;
  }

  return (
    <div className="photo-grid">
      {photos.map((filename) => {
        const isSelected = selected.has(filename);
        return (
          <div
            key={filename}
            className={`photo-tile ${isSelected ? "photo-tile-selected" : ""}`}
            onClick={() => onToggle(filename)}
          >
            <img src={getPhotoUrl(filename)} alt={filename} className="photo-thumb" />
          </div>
        );
      })}
    </div>
  );
}
