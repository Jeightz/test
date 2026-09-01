export const RATING_CHOICES = [
  {
    value: 5,
    label: "5 — Very consistent",
    hint: "The photo, price, and location look reliable.",
  },
  {
    value: 4,
    label: "4 — Consistent",
    hint: "Most of the report looks accurate.",
  },
  {
    value: 3,
    label: "3 — Unsure",
    hint: "Some details are hard to confirm.",
  },
  {
    value: 2,
    label: "2 — Inconsistent",
    hint: "The price or evidence does not match well.",
  },
  {
    value: 1,
    label: "1 — Looks unreliable",
    hint: "The report appears inaccurate or fake.",
  },
];

export function emptyDistribution() {
  return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
}

export function distributionFromCounts(row) {
  return {
    1: Number(row.rating_1 || 0),
    2: Number(row.rating_2 || 0),
    3: Number(row.rating_3 || 0),
    4: Number(row.rating_4 || 0),
    5: Number(row.rating_5 || 0),
  };
}

export function trustLevel(score, count) {
  if (!count) {
    return { key: "none", label: "No community ratings yet" };
  }

  const value = Number(score);
  if (value >= 4) {
    return { key: "strong", label: "Strong community trust" };
  }
  if (value >= 3) {
    return { key: "moderate", label: "Moderate community trust" };
  }
  return { key: "low", label: "Low community trust" };
}
