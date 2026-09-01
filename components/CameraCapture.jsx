"use client";

import { useEffect, useRef } from "react";

export default function CameraCapture({ photoUrl, onCapture, onClear, error }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      onClear("Camera is not available in this browser.");
      return;
    }

    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (cameraError) {
      if (cameraError.name === "NotAllowedError" || cameraError.name === "PermissionDeniedError") {
        onClear("Camera permission was denied. Allow camera access to capture a photo.");
        return;
      }
      if (cameraError.name === "NotFoundError" || cameraError.name === "OverconstrainedError") {
        onClear("No camera was found on this device.");
        return;
      }
      onClear("Could not start the camera.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) {
      onClear("Wait for the camera preview before capturing.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          onClear("Could not capture the photo. Try again.");
          return;
        }
        stopCamera();
        onCapture(blob);
      },
      "image/jpeg",
      0.9
    );
  }

  useEffect(() => {
    if (!photoUrl) {
      startCamera();
    }

    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoUrl]);

  if (photoUrl) {
    return (
      <div className="camera">
        <p>Captured photo</p>
        <img src={photoUrl} alt="Captured report evidence" className="camera-preview" />
        <button
          type="button"
          onClick={() => {
            onCapture(null);
          }}
        >
          Retake photo
        </button>
      </div>
    );
  }

  return (
    <div className="camera">
      <p>Live camera</p>
      <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
      <button type="button" onClick={capturePhoto}>
        Capture photo
      </button>
      {error ? <p>{error}</p> : null}
    </div>
  );
}
