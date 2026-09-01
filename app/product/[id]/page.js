"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import PriceIndicator from "../../../components/PriceIndicator";
import PriceScale from "../../../components/PriceScale";
import LocalMedian from "../../../components/LocalMedian";
import { TrustSummary } from "../../../components/TrustScore";
import ReportList from "../../../components/ReportList";
import { geolocationErrorMessage, locationFromNominatim } from "../../../lib/locationFields";
import { formatPeso, productImageSrc, trustPercent } from "../../../lib/productImages";

export default function ProductPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const justSubmitted = searchParams.get("submitted") === "1";
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const [barangay, setBarangay] = useState("");
  const [city, setCity] = useState("");
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("Detecting your location...");

  async function loadLocation() {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not available on this device.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setCoords({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { Accept: "application/json" } }
          );

          if (!response.ok) {
            setLocationStatus("Could not look up your address. Nearby median still uses your coordinates.");
            return;
          }

          const parsed = locationFromNominatim(await response.json());
          if (parsed.barangay) {
            setBarangay(parsed.barangay);
          }
          if (parsed.city) {
            setCity(parsed.city);
          }
          setLocationStatus(parsed.displayName || `${parsed.barangay}, ${parsed.city}`.trim());
        } catch (error) {
          setLocationStatus("Could not reach the location lookup service. Nearby median still uses your coordinates.");
        }
      },
      (error) => {
        setLocationStatus(geolocationErrorMessage(error));
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function loadProduct() {
    const query = new URLSearchParams();
    if (barangay) {
      query.set("barangay", barangay);
    }
    if (city) {
      query.set("city", city);
    }
    if (coords) {
      query.set("lat", String(coords.lat));
      query.set("lng", String(coords.lng));
    }

    const response = await fetch(`/api/products/${params.id}?${query.toString()}`);
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || "Could not load product.");
      return;
    }
    setData(result);
  }

  useEffect(() => {
    fetch("/api/session");
    loadLocation();
  }, []);

  useEffect(() => {
    if (params.id) {
      loadProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, coords, barangay, city]);

  if (message) {
    return (
      <main className="app-shell">
        <p>{message}</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="app-shell">
        <p>Loading...</p>
      </main>
    );
  }

  const latest = data.latestReport;
  const displayPrice = latest?.price ?? data.srp?.price;
  const heroImage = productImageSrc({
    product_id: data.product.product_id,
    photo_url: latest?.photo_url,
  });
  const mapped = data.reports.find((row) => row.latitude && row.longitude);
  const percent = trustPercent(data.trustScore);

  return (
    <main className="app-shell product-shell">
      {justSubmitted ? (
        <p className="notice-success">
          Your anonymous price report was saved. Review it below. You can rate other reports
          for consistency, but this device cannot rate the same report twice.
        </p>
      ) : null}
      <div className="product-view">
        <section className="product-photo-panel">
          <img src={heroImage} alt={data.product.name} />
        </section>

        <section className="product-detail-panel">
          <div className="product-detail-top">
            <img src={heroImage} alt="" className="product-thumb" />
            <div>
              <p className="product-card-category">{data.product.category_name}</p>
              <h1>{data.product.name}</h1>
              <p className="product-price-row">
                <strong>{formatPeso(displayPrice) || "No price yet"}</strong>
                <PriceIndicator value={data.priceIndicator} />
              </p>
            </div>
            <Link href="/report" className="button-secondary">
              Report another
            </Link>
          </div>

          <div className="stat-row">
            <article>
              <p>Median price</p>
              <strong>{formatPeso(data.medians.nearby ?? data.medians.barangay ?? data.medians.city) || "No data yet"}</strong>
            </article>
            <article>
              <p>Price range</p>
              <strong>
                {data.priceRange
                  ? `${formatPeso(data.priceRange.min)} - ${formatPeso(data.priceRange.max)}`
                  : "No data yet"}
              </strong>
            </article>
            <article>
              <p>Trust score (anonymous)</p>
              <strong>{percent}%</strong>
              <span className="trust-bar">
                <span style={{ width: `${percent}%` }} />
              </span>
            </article>
          </div>

          <section className="panel">
            <h2>Current DTI SRP</h2>
            {data.srp ? (
              <p>
                {formatPeso(data.srp.price)} (effective {String(data.srp.effective_date).slice(0, 10)})
              </p>
            ) : (
              <p>No government SRP is available for this product.</p>
            )}
          </section>

          <section className="panel">
            <h2>Local area</h2>
            <p>{locationStatus}</p>
            {barangay || city ? (
              <p>
                {barangay ? `Barangay: ${barangay}` : ""}
                {barangay && city ? " · " : ""}
                {city ? `City: ${city}` : ""}
              </p>
            ) : null}
            <p className="muted">Local medians are filtered by barangay and city when location is available.</p>
          </section>

          <LocalMedian medians={data.medians} />

          <section className="panel">
            <h2>Fair / High / Overpriced indicator</h2>
            <p>Flagged from the difference between the reported price, DTI SRP, and local median.</p>
            <PriceScale value={data.priceIndicator} />
          </section>

          <section className="panel">
            <h2>View location</h2>
            {mapped ? (
              <iframe
                title="Reported location map"
                className="location-map"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(mapped.longitude) - 0.02}%2C${Number(mapped.latitude) - 0.02}%2C${Number(mapped.longitude) + 0.02}%2C${Number(mapped.latitude) + 0.02}&layer=mapnik&marker=${mapped.latitude}%2C${mapped.longitude}`}
              />
            ) : (
              <p>No mapped coordinates are available for this product yet.</p>
            )}
          </section>

          <section className="panel">
            <h2>Community trust score</h2>
            <p>
              Anonymous users rate whether submitted price reports look consistent. This score
              is the average of those ratings for this product.
            </p>
            <TrustSummary
              score={data.trustScore}
              ratingCount={data.ratingCount}
              distribution={data.trustDistribution}
            />
          </section>
        </section>
      </div>

      <section className="reports-wrap">
        <h2>Reported prices</h2>
        <ReportList reports={data.reports} onRated={loadProduct} />
      </section>
    </main>
  );
}
