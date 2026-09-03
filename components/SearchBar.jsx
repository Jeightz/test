"use client";

import { useState } from "react";
import CameraSearch from "./CameraSearch";

export default function SearchBar({ query, onQueryChange, onSearch, nearby, onNearbyChange, onImageMatch, onImageNoMatch }) {
  const [mode, setMode] = useState("normal");
  const [cameraError, setCameraError] = useState("");
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState("");
  const [searching, setSearching] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    onSearch();
  }

  async function searchByImage(blob) {
    setSearching(true);
    setCameraError("");

    const formData = new FormData();
    formData.append("photo", blob, "search.jpg");

    try {
      const res = await fetch("/api/search-by-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setCameraError(data.error || "No matching item found.");
          onImageNoMatch();
        } else {
          setCameraError(data.error || "Search failed. Please try again.");
        }
        return;
      }

      onImageMatch(data.match);
      setMode("normal");
      setCapturedPhotoUrl("");
    } catch (err) {
      console.error("Image search request failed:", err);
      setCameraError("Search failed. Please check your connection and try again.");
    } finally {
      setSearching(false);
    }
  }

  function handleCameraCapture(blob) {
    if (blob) {
      setCapturedPhotoUrl(URL.createObjectURL(blob));
      setCameraError("");
      searchByImage(blob);
    } else {
      setCapturedPhotoUrl("");
    }
  }

  function handleCameraCancel(errorText) {
    if (errorText) {
      setCameraError(errorText);
    }
    setMode("normal");
    setCapturedPhotoUrl("");
  }

  function switchToCamera() {
    setCameraError("");
    setCapturedPhotoUrl("");
    setMode("camera");
  }

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      setCapturedPhotoUrl(URL.createObjectURL(file));
      searchByImage(file);
    }
    event.target.value = "";
  }

  if (mode === "camera") {
    return (
      <div className="search-bar search-bar-camera">
        <div className="search-mode-header">
          <span className="search-mode-label">Live Camera Search</span>
          <button type="button" className="camera-secondary" onClick={() => handleCameraCancel("")}>
            Back to text search
          </button>
        </div>
        <CameraSearch
          onCapture={handleCameraCapture}
          onCancel={handleCameraCancel}
          error={cameraError}
        />
        {capturedPhotoUrl && searching ? (
          <p className="camera-search-status">Analyzing photo — this can take up to 20 seconds the first time...</p>
        ) : null}
      </div>
    );
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search product name"
      />
      <label className="nearby-option">
        <input type="checkbox" checked={nearby} onChange={(event) => onNearbyChange(event.target.checked)} />
        Nearby items
      </label>
      <button type="submit">Search</button>
      <button type="button" className="camera-secondary" onClick={switchToCamera} disabled={searching}>
        Use Live Camera
      </button>
      <label className={`camera-secondary upload-button${searching ? " upload-button-disabled" : ""}`}>
        Upload
        <input type="file" accept="image/*" onChange={handleFileChange} hidden disabled={searching} />
      </label>
      {searching ? (
        <p className="camera-search-status">Analyzing photo — this can take up to 20 seconds the first time...</p>
      ) : null}
      {!searching && cameraError ? <p className="camera-error">{cameraError}</p> : null}
    </form>
  );
}