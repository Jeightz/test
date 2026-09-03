"use client";

import PriceIndicator from "./PriceIndicator";
import TrustScore from "./TrustScore";
import { formatPeso } from "../lib/productImages";

function formatWhen(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }
  return date.toLocaleString();
}

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

export default function ReportList({ reports, onRated, coords }) {
  if (!reports.length) {
    return <p>No crowdsourced reports yet.</p>;
  }

  return (
    <ul className="report-list">
      {reports.map((report) => {
        const hasReportCoords = report.latitude != null && report.longitude != null;
        const distanceKm =
          coords && hasReportCoords
            ? haversineDistanceKm(
                coords.lat,
                coords.lng,
                Number(report.latitude),
                Number(report.longitude)
              )
            : null;

        return (
          <li key={report.report_id} className="report-card">
            <img src={report.photo_url} alt="Captured price evidence" />
            <div className="report-body">
              <dl className="report-facts">
                <div>
                  <dt>Reported price</dt>
                  <dd>
                    <strong>{formatPeso(report.price) || "—"}</strong>{" "}
                    <PriceIndicator value={report.price_indicator} />
                  </dd>
                </div>
                <div>
                  <dt>Detected location</dt>
                  <dd>
                    {report.barangay}, {report.city}, {report.country}
                    {hasReportCoords ? (
                      <span>
                        {" "}
                        ({Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)})
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div>
                  <dt>Distance from you</dt>
                  <dd>
                    {distanceKm !== null
                      ? formatDistance(distanceKm)
                      : hasReportCoords
                      ? "Enable location access to see this"
                      : "No coordinates recorded"}
                  </dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{formatWhen(report.date_reported)}</dd>
                </div>
              </dl>
              <TrustScore
                score={report.trust_score}
                ratingCount={report.rating_count}
                distribution={report.distribution}
                comments={report.trust_comments}
                reportId={report.report_id}
                alreadyRated={report.rated_by_device}
                onRated={onRated}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}