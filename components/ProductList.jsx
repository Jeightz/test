"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Haversine formula — great-circle distance between two lat/lng points, in km
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} m away`;
  }
  return `${km.toFixed(1)} km away`;
}

function useMyCoords() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStatus("ready");
      },
      () => setStatus("error"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }, []);

  return { coords, status };
}

export default function ProductList({ products }) {
  const { coords, status } = useMyCoords();

  if (!products.length) {
    return <p>No products found.</p>;
  }

  return (
    <ul className="product-list">
      {products.map((product) => {
        const hasProductCoords = product.latitude != null && product.longitude != null;
        const distanceKm =
          coords && hasProductCoords
            ? haversineDistanceKm(coords.lat, coords.lng, Number(product.latitude), Number(product.longitude))
            : null;

        return (
          <li key={product.product_id}>
            <Link href={`/product/${product.product_id}`}>
              <strong>{product.name}</strong>
              <span>{product.category_name}</span>
              <span>{product.report_count} report(s)</span>
              {hasProductCoords ? (
                <span>
                  {distanceKm !== null
                    ? formatDistance(distanceKm)
                    : status === "error"
                    ? "Enable location access to see distance"
                    : "Checking distance..."}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}