"use client";

/**
 * components/WebcamCapture.tsx
 * ------------------------------
 * Opens the browser webcam, shows a live preview, and lets the user
 * capture a single frame (used to scan the customer's face).
 *
 * Usage: <WebcamCapture onCapture={(imageDataUrl) => ...} onClose={() => ...} />
 */

import { useEffect, useRef, useState } from "react";

interface WebcamCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

export default function WebcamCapture({ onCapture, onClose }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start the webcam as soon as this component mounts
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        setError("Could not access webcam. Please allow camera permission.");
      }
    }

    startCamera();

    // Cleanup: stop the camera when component unmounts
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  /**
   * Draws the current video frame onto a hidden canvas, then converts
   * it to a base64 JPEG string that we can send to the backend.
   */
  function handleCapture() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    onCapture(imageDataUrl);
  }

  return (
    <div className="webcam-overlay">
      <div className="webcam-box">
        {error ? (
          <p className="webcam-error">{error}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="webcam-video" />
        )}

        <div className="webcam-controls">
          <button onClick={handleCapture} disabled={!!error} className="btn btn-primary">
            📸 Capture
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
