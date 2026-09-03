"use client";

import { useEffect, useRef, useState } from "react";

export default function CameraSearch({ onCapture, onCancel, error }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const cameraActiveRef = useRef(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [capturedBlob, setCapturedBlob] = useState(null);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      onCancel("Camera is not available in this browser.");
      return;
    }

    stopCamera();
    cameraActiveRef.current = true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      // The user may have cancelled while the camera was starting
      if (!cameraActiveRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (cameraError) {
      if (!cameraActiveRef.current) return;

      if (cameraError.name === "NotAllowedError" || cameraError.name === "PermissionDeniedError") {
        onCancel("Camera permission was denied. Allow camera access to capture a photo.");
        return;
      }
      if (cameraError.name === "NotFoundError" || cameraError.name === "OverconstrainedError") {
        onCancel("No camera was found on this device.");
        return;
      }
      onCancel("Could not start the camera.");
    }
  }

  function stopCamera() {
    cameraActiveRef.current = false;
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
      onCancel("Wait for the camera preview before capturing.");
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
          onCancel("Could not capture the photo. Try again.");
          return;
        }
        stopCamera();
        setCapturedBlob(blob);
        setPhotoUrl(URL.createObjectURL(blob));
        onCapture(blob);
      },
      "image/jpeg",
      0.9
    );
  }

  function retake() {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }
    setPhotoUrl("");
    setCapturedBlob(null);
    onCapture(null);
    startCamera();
  }

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (photoUrl) {
    return (
      <div className="camera">
        <p>Captured item photo</p>
        <img src={photoUrl} alt="Captured item" className="camera-preview" />
        <div className="camera-actions">
          <button type="button" onClick={retake}>
            Retake photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="camera">
      <p>Live camera</p>
      <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
      <div className="camera-actions">
        <button type="button" onClick={capturePhoto}>
          Capture photo
        </button>
        <button type="button" className="camera-secondary" onClick={() => onCancel("")}>
          Cancel
        </button>
      </div>
      {error ? <p className="camera-error">{error}</p> : null}
    </div>
  );
}