"use client";

import { useState } from "react";
import { RATING_CHOICES, emptyDistribution, trustLevel } from "../lib/trust";
import { trustPercent } from "../lib/productImages";

function starDisplay(value) {
  const rounded = Math.round(Number(value) || 0);
  const full = Math.max(0, Math.min(5, rounded));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

export function TrustSummary({ score, ratingCount, distribution, comments }) {
  const counts = distribution || emptyDistribution();
  const total = Number(ratingCount || 0);
  const level = trustLevel(score, total);
  const percent = total ? trustPercent(score) : 0;
  const commentList = Array.isArray(comments) ? comments : [];

  return (
    <div className="trust-summary">
      <p className={`trust-level trust-level-${level.key}`}>{level.label}</p>
      <p>
        Average consistency: <strong>{total ? Number(score).toFixed(2) : "—"} / 5</strong>
        {total ? ` (${percent}%)` : ""}
      </p>
      <p>{total} anonymous rating{total === 1 ? "" : "s"}</p>
      {total ? (
        <ul className="rating-distribution">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = counts[star] || 0;
            const width = total ? Math.round((count / total) * 100) : 0;
            return (
              <li key={star}>
                <span>{star}</span>
                <span className="trust-bar">
                  <span style={{ width: `${width}%` }} />
                </span>
                <span>{count}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No consistency ratings have been given yet.</p>
      )}
      {commentList.length ? (
        <ul className="trust-comments">
          {commentList.map((item, index) => {
            const comment = item?.comment || item?.description || item?.review || "";
            if (!comment) {
              return null;
            }
            return (
              <li key={index} className="trust-comment">
                <span className="trust-comment-stars">{starDisplay(item?.rating)}</span>
                <p className="trust-comment-text">"{comment}"</p>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default function TrustScore({
  score,
  ratingCount,
  distribution,
  comments,
  reportId,
  alreadyRated,
  onRated,
}) {
  const [rating, setRating] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(Boolean(alreadyRated));

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");

    const value = Number(rating);
    if (!reportId) {
      setMessageType("error");
      setMessage("This rating is missing a report to attach to.");
      return;
    }
    if (!rating || Number.isNaN(value) || value < 1 || value > 5 || !Number.isInteger(value)) {
      setMessageType("error");
      setMessage("Choose a consistency rating from 1 (unreliable) to 5 (very consistent).");
      return;
    }
    if (description.trim().length > 255) {
      setMessageType("error");
      setMessage("The reason must be 255 characters or fewer.");
      return;
    }

    setSaving(true);
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        rating: value,
        description: description.trim(),
      }),
    });
    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessageType("error");
      setMessage(data.error || "The rating was not saved.");
      if (response.status === 409) {
        setDone(true);
      }
      return;
    }

    setDone(true);
    setDescription("");
    setMessageType("success");
    setMessage(data.message || "Anonymous consistency rating saved.");
    if (onRated) {
      onRated();
    }
  }

  return (
    <div className="trust">
      <TrustSummary
        score={score}
        ratingCount={ratingCount}
        distribution={distribution}
        comments={comments}
      />
      {reportId && !done ? (
        <form onSubmit={handleSubmit} noValidate>
          <p>
            Rate whether this anonymous price report looks consistent. You are not rating the
            store. You are rating the submitted photo, price, and location.
          </p>
          <fieldset className="rating-choices">
            <legend>Consistency rating (required)</legend>
            {RATING_CHOICES.map((choice) => (
              <label key={choice.value} className="rating-option">
                <input
                  type="radio"
                  name={`rating-${reportId}`}
                  value={choice.value}
                  checked={rating === String(choice.value)}
                  onChange={(event) => setRating(event.target.value)}
                />
                <span>
                  <strong>{choice.label}</strong>
                  <small>{choice.hint}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <label>
            Optional reason
            <input
              value={description}
              maxLength={255}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Why does this report look consistent or unreliable?"
            />
          </label>
          <button type="submit" disabled={saving}>
            {saving ? "Saving rating..." : "Submit anonymous rating"}
          </button>
        </form>
      ) : null}
      {reportId && done && !message ? (
        <p className="notice-success">This device already submitted a rating for this report.</p>
      ) : null}
      {message ? <p className={messageType === "success" ? "notice-success" : "notice-error"}>{message}</p> : null}
    </div>
  );
}
