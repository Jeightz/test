"use client";

import { useEffect, useRef, useState } from "react";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function CameraCapture({ photoUrl, onCapture, onClear, error }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraActiveRef = useRef(false);
  const [mode, setMode] = useState(null);

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      onClear("Camera is not available in this browser. You can upload an image instead.");
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
        onClear("Camera permission was denied. Allow camera access to capture a photo, or upload an image instead.");
        return;
      }
      if (cameraError.name === "NotFoundError" || cameraError.name === "OverconstrainedError") {
        onClear("No camera was found on this device. You can upload an image instead.");
        return;
      }
      onClear("Could not start the camera. You can upload an image instead.");
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

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      onClear("Please choose a JPG, PNG, or WEBP image.");
      return;
    }

    onCapture(file);
    setMode(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Stop the camera when leaving camera mode or when a photo is set
  useEffect(() => {
    if (mode !== "camera" || photoUrl) {
      stopCamera();
    }
  }, [mode, photoUrl]);

  // Start the camera when entering camera mode with no photo yet
  useEffect(() => {
    if (mode === "camera" && !photoUrl) {
      startCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, photoUrl]);

  // Show the captured/selected photo with replace option
  if (photoUrl) {
    return (
      <div className="camera">
        <p>Item photo</p>
        <img src={photoUrl} alt="Item evidence" className="camera-preview" />
        <div className="camera-actions">
          <button
            type="button"
            onClick={() => {
              onCapture(null);
              setMode(null);
            }}
          >
            Replace photo
          </button>
        </div>
      </div>
    );
  }

  // Show the two input options
  if (!mode) {
    return (
      <div className="camera">
        <p>Item photo</p>
        <div className="camera-options">
          <button type="button" onClick={() => setMode("upload")}>
            Upload Image
          </button>
          <button type="button" onClick={() => setMode("camera")}>
            Use Live Camera
          </button>
        </div>
        {error ? <p className="camera-error">{error}</p> : null}
      </div>
    );
  }

  // Upload mode
  if (mode === "upload") {
    return (
      <div className="camera">
        <p>Upload an image from your device</p>
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          onChange={handleFileChange}
          className="camera-file-input"
        />
        <div className="camera-actions">
          <button type="button" onClick={() => fileInputRef.current?.click()}>
            Choose image
          </button>
          <button type="button" className="camera-secondary" onClick={() => setMode(null)}>
            Back
          </button>
        </div>
        {error ? <p className="camera-error">{error}</p> : null}
      </div>
    );
  }

  // Camera mode
  return (
    <div className="camera">
      <p>Live camera</p>
      <video ref={videoRef} autoPlay playsInline muted className="camera-preview" />
      <div className="camera-actions">
        <button type="button" onClick={capturePhoto}>
          Capture photo
        </button>
        <button type="button" className="camera-secondary" onClick={() => setMode(null)}>
          Cancel
        </button>
      </div>
      {error ? <p className="camera-error">{error}</p> : null}
    </div>
  );
}