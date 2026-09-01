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

export default function ReportList({ reports, onRated }) {
  if (!reports.length) {
    return <p>No crowdsourced reports yet.</p>;
  }

  return (
    <ul className="report-list">
      {reports.map((report) => (
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
                  {report.latitude != null && report.longitude != null ? (
                    <span>
                      {" "}
                      ({Number(report.latitude).toFixed(5)}, {Number(report.longitude).toFixed(5)})
                    </span>
                  ) : null}
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
              reportId={report.report_id}
              alreadyRated={report.rated_by_device}
              onRated={onRated}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
