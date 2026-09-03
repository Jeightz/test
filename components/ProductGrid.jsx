"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPeso, productImageSrc } from "../lib/productImages";

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

export default function ProductGrid({ products }) {
  const { coords, status } = useMyCoords();

  if (!products.length) {
    return <p className="empty-note">No matching products found.</p>;
  }

  return (
    <div className="product-grid">
      {products.map((product) => {
        const price = formatPeso(product.latest_price) || formatPeso(product.srp_price);
        const hasProductCoords = product.latitude != null && product.longitude != null;
        const distanceKm =
          coords && hasProductCoords
            ? haversineDistanceKm(coords.lat, coords.lng, Number(product.latitude), Number(product.longitude))
            : null;

        return (
          <Link
            key={product.product_id}
            href={`/product/${product.product_id}`}
            className="product-card"
          >
            <img src={productImageSrc(product)} alt={product.name} />
            <div className="product-card-body">
              <p className="product-card-category">{product.category_name}</p>
              <h3>{product.name}</h3>
              <div className="product-card-meta">
                <strong>{price || "No price yet"}</strong>
                {product.srp_price ? <span>SRP {formatPeso(product.srp_price)}</span> : null}
              </div>
              <p className="product-card-reports">{product.report_count} report(s)</p>
              {hasProductCoords ? (
                <p className="product-card-distance">
                  {distanceKm !== null
                    ? formatDistance(distanceKm)
                    : status === "error"
                    ? "Enable location access to see distance"
                    : "Checking distance..."}
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}