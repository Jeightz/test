"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CameraCapture from "./CameraCapture";
import { geolocationErrorMessage, locationFromNominatim } from "../lib/locationFields";

function missingReportFields({ productName, price, location, photo }) {
  const missing = [];

  if (!productName) {
    missing.push("product name");
  }

  if (price == null || Number.isNaN(price) || price <= 0) {
    missing.push("price");
  }

  if (!location) {
    missing.push("device location");
  } else {
    if (!location.barangay) {
      missing.push("barangay/village from your location");
    }
    if (!location.city) {
      missing.push("city/municipality from your location");
    }
    if (!location.country) {
      missing.push("country from your location");
    }
    if (location.latitude == null || location.longitude == null) {
      missing.push("latitude and longitude");
    }
  }

  if (!photo) {
    missing.push("captured photo");
  }

  return missing;
}

export default function ReportForm() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [saving, setSaving] = useState(false);
  const [locationStatus, setLocationStatus] = useState("Detecting your location...");
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [cameraError, setCameraError] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");

  async function detectLocation() {
    setLocation(null);
    setLocationStatus("Detecting your location...");
    setMessage("");

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not available on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            { headers: { Accept: "application/json" } }
          );

          if (!response.ok) {
            setLocationStatus("Could not look up your address. Try again.");
            return;
          }

          const data = await response.json();
          const parsed = locationFromNominatim(data);

          if (!parsed.barangay || !parsed.city || !parsed.country) {
            setLocation(null);
            setLocationStatus(
              "Your coordinates were found, but the map did not return a complete address. Try again."
            );
            return;
          }

          const nextLocation = {
            ...parsed,
            latitude,
            longitude,
          };
          setLocation(nextLocation);
          setLocationStatus(parsed.displayName || `${parsed.barangay}, ${parsed.city}, ${parsed.country}`);
        } catch (error) {
          setLocationStatus("Could not reach the location lookup service. Check your internet connection.");
        }
      },
      (error) => {
        setLocation(null);
        setLocationStatus(geolocationErrorMessage(error));
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  useEffect(() => {
    detectLocation();
  }, []);

  useEffect(() => {
    return () => {
      if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };
  }, [photoUrl]);

  function handleCapture(blob) {
    if (photoUrl) {
      URL.revokeObjectURL(photoUrl);
    }

    if (!blob) {
      setPhoto(null);
      setPhotoUrl("");
      setCameraError("");
      return;
    }

    setPhoto(blob);
    setPhotoUrl(URL.createObjectURL(blob));
    setCameraError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    const parsedPrice = Number(price);
    const missing = missingReportFields({
      productName: productName.trim(),
      price: parsedPrice,
      location,
      photo,
    });

    if (missing.length) {
      setMessageType("error");
      setMessage(`The report was not sent. Please complete: ${missing.join(", ")}.`);
      return;
    }

    setSaving(true);

    const formData = new FormData();
    formData.set("product_name", productName.trim());
    formData.set("price", String(parsedPrice));
    formData.set("barangay", location.barangay);
    formData.set("city", location.city);
    formData.set("province", location.province || "");
    formData.set("country", location.country);
    formData.set("latitude", String(location.latitude));
    formData.set("longitude", String(location.longitude));
    formData.set("photo", photo, "capture.jpg");

    const response = await fetch("/api/reports", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessageType("error");
      setMessage(data.error || "The report was not saved. Check the required fields and try again.");
      return;
    }

    setMessageType("success");
    setMessage(data.message || "Anonymous price report saved. Opening the product page...");
    router.push(`/product/${data.productId}?submitted=1`);
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label>
        Product name
        <input
          name="product_name"
          value={productName}
          onChange={(event) => setProductName(event.target.value)}
          placeholder="Example: Well-milled rice (per kg)"
        />
      </label>
      <label>
        Price
        <input
          name="price"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />
      </label>

      <div className="panel" style={{ marginBottom: 0 }}>
        <h2>Location</h2>
        <p>{locationStatus}</p>
        {location ? (
          <ul className="median-list">
            <li>
              <span>Barangay / village</span>
              <strong>{location.barangay}</strong>
            </li>
            <li>
              <span>City / municipality</span>
              <strong>{location.city}</strong>
            </li>
            {location.province ? (
              <li>
                <span>Province / state</span>
                <strong>{location.province}</strong>
              </li>
            ) : null}
            <li>
              <span>Country</span>
              <strong>{location.country}</strong>
            </li>
            <li>
              <span>Coordinates</span>
              <strong>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </strong>
            </li>
          </ul>
        ) : null}
        <button type="button" onClick={detectLocation}>
          Detect location again
        </button>
      </div>

      <CameraCapture
        photoUrl={photoUrl}
        onCapture={handleCapture}
        onClear={(errorText) => {
          handleCapture(null);
          setCameraError(errorText);
          setMessageType("error");
          setMessage(errorText);
        }}
        error={cameraError}
      />

      <button type="submit" disabled={saving}>
        {saving ? "Submitting..." : "Submit anonymous report"}
      </button>
      {message ? (
        <p className={messageType === "success" ? "notice-success" : "notice-error"}>{message}</p>
      ) : null}
    </form>
  );
}
