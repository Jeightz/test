import { NextResponse } from "next/server";
import { query } from "../../../../lib/db";
import { classifyPrice, median } from "../../../../lib/price";
import { nearbyDistanceSql } from "../../../../lib/location";
import { getOrCreateSession } from "../../../../lib/session";
import { distributionFromCounts } from "../../../../lib/trust";

function toNumber(value) {
  if (value == null) {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export async function GET(request, { params }) {
  const { id } = await params;
  const productId = Number(id);
  const { searchParams } = new URL(request.url);
  const barangay = (searchParams.get("barangay") || "").trim();
  const city = (searchParams.get("city") || "").trim();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  try {
    const productResult = await query(
      `SELECT p.product_id, p.name, c.name AS category_name
       FROM product p
       JOIN category c ON c.category_id = p.category_id
       WHERE p.product_id = $1`,
      [productId]
    );

    if (!productResult.rows[0]) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    const srpResult = await query(
      `SELECT price, effective_date
       FROM srp
       WHERE product_id = $1
       ORDER BY effective_date DESC, srp_id DESC
       LIMIT 1`,
      [productId]
    );

    const session = await getOrCreateSession();

    const reportsResult = await query(
      `SELECT r.report_id, r.price, r.photo_url, r.date_reported,
              a.barangay, a.city, a.country, a.latitude, a.longitude,
              COALESCE(AVG(t.rating), 0) AS trust_score,
              COUNT(t.trust_id)::int AS rating_count,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 1)::int AS rating_1,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 2)::int AS rating_2,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 3)::int AS rating_3,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 4)::int AS rating_4,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 5)::int AS rating_5,
              COALESCE(
                json_agg(
                  json_build_object('rating', t.rating, 'comment', t.description)
                ) FILTER (WHERE t.trust_id IS NOT NULL),
                '[]'
              ) AS trust_comments,
              EXISTS (
                SELECT 1 FROM trust_rating x
                WHERE x.report_id = r.report_id AND x.session_id = $2
              ) AS rated_by_device
       FROM report r
       JOIN address a ON a.address_id = r.address_id
       LEFT JOIN trust_rating t ON t.report_id = r.report_id
       WHERE r.product_id = $1
       GROUP BY r.report_id, a.barangay, a.city, a.country, a.latitude, a.longitude
       ORDER BY r.date_reported DESC`,
      [productId, session.session_id]
    );

    const reports = reportsResult.rows;
    const srpPrice = toNumber(srpResult.rows[0]?.price);

    // Fairness must be judged against the SRP (not the local median itself —
    // that would be circular: the median can't be "only fair prices" if fair
    // is defined by that same median). classifyPrice already prefers srpPrice
    // over the median reference, so passing null here isolates that check.
    const isFairReport = (row) => classifyPrice(row.price, srpPrice, null) === "Fair";

    // When there's no SRP at all, there's no independent reference to judge
    // fairness by — bootstrap one: take the raw (unfiltered) median of the
    // group as a rough reference, classify each report against that, then
    // recompute the median from just the reports that pass. Falls back to
    // the raw median if nothing passes (e.g. only 1-2 wildly spread reports).
    function fairMedian(rows) {
      const allPrices = rows.map((row) => row.price);
      if (srpPrice != null) {
        const filtered = rows.filter(isFairReport).map((row) => row.price);
        return median(filtered.length ? filtered : allPrices);
      }
      const rawMedian = median(allPrices);
      if (rawMedian == null) {
        return null;
      }
      const filtered = rows
        .filter((row) => classifyPrice(row.price, null, rawMedian) === "Fair")
        .map((row) => row.price);
      return median(filtered.length ? filtered : allPrices);
    }

    // FIXED: Added null checks before calling .toLowerCase(). Also fall back
    // to the unfiltered report set if the location match is too strict (e.g.
    // your real location doesn't match where any reports were submitted) —
    // otherwise a near-miss silently produces zero reports, which cascades
    // into a null median and an "Unavailable" indicator even though reports
    // for this product clearly exist.
    const cityMatches = reports.filter(
      (row) =>
        row.city &&
        (!city || row.city.trim().toLowerCase() === city.trim().toLowerCase())
    );
    const cityReports = cityMatches.length ? cityMatches : reports;

    const barangayMatches = cityReports.filter(
      (row) =>
        row.barangay &&
        (!barangay || row.barangay.trim().toLowerCase() === barangay.trim().toLowerCase())
    );
    const barangayReports = barangayMatches.length ? barangayMatches : cityReports;

    let nearbyReports = [];
    if (lat && lng) {
      const distance = nearbyDistanceSql("$2", "$3");
      const nearbyResult = await query(
        `SELECT r.price
         FROM report r
         JOIN address a ON a.address_id = r.address_id
         WHERE r.product_id = $1
           AND a.latitude IS NOT NULL
           AND a.longitude IS NOT NULL
           AND ${distance} <= 5`,
        [productId, Number(lat), Number(lng)]
      );
      nearbyReports = nearbyResult.rows.map((row) => ({ price: toNumber(row.price) }));
    }

    const medians = {
      nearby: fairMedian(nearbyReports),
      barangay: fairMedian(barangayReports),
      city: fairMedian(cityReports),
    };

    const localMedian = medians.nearby ?? medians.barangay ?? medians.city;

    const trustResult = await query(
      `SELECT COALESCE(AVG(t.rating), 0) AS trust_score,
              COUNT(t.trust_id)::int AS rating_count,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 1)::int AS rating_1,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 2)::int AS rating_2,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 3)::int AS rating_3,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 4)::int AS rating_4,
              COUNT(t.trust_id) FILTER (WHERE ROUND(t.rating) = 5)::int AS rating_5,
              COALESCE(
                json_agg(
                  json_build_object('rating', t.rating, 'comment', t.description)
                ),
                '[]'
              ) AS trust_comments
       FROM trust_rating t
       JOIN report r ON r.report_id = t.report_id
       WHERE r.product_id = $1`,
      [productId]
    );

    const reportsWithIndicator = reports.map((row) => ({
      ...row,
      price: toNumber(row.price),
      trust_score: toNumber(row.trust_score),
      price_indicator: classifyPrice(row.price, srpPrice, localMedian),
      distribution: distributionFromCounts(row),
      rated_by_device: Boolean(row.rated_by_device),
      trust_comments: row.trust_comments || [],
    }));

    const reportPrices = reportsWithIndicator.map((row) => row.price).filter((value) => value != null);
    const priceRange = reportPrices.length
      ? { min: Math.min(...reportPrices), max: Math.max(...reportPrices) }
      : null;

    // Pick the report closest to the local median (i.e. the "fairest" one) to
    // represent this product's overall indicator — matches the report the
    // frontend shows as the hero, so the two badges can never disagree.
    const fairReports = reportsWithIndicator.filter((row) => row.price_indicator === "Fair");
    const fairestPool = fairReports.length ? fairReports : reportsWithIndicator;
    const fairestReport =
      localMedian != null && fairestPool.length
        ? fairestPool.reduce((best, row) =>
            Math.abs(row.price - localMedian) < Math.abs(best.price - localMedian) ? row : best
          )
        : reportsWithIndicator[0] || null;
    const productIndicator = fairestReport?.price_indicator ?? null;

    return NextResponse.json({
      product: productResult.rows[0],
      srp: srpResult.rows[0]
        ? {
            price: srpPrice,
            effective_date: srpResult.rows[0].effective_date,
          }
        : null,
      priceIndicator: productIndicator,
      trustScore: toNumber(trustResult.rows[0].trust_score),
      ratingCount: trustResult.rows[0].rating_count,
      trustDistribution: distributionFromCounts(trustResult.rows[0]),
      trustComments: trustResult.rows[0].trust_comments || [],
      medians,
      priceRange,
      latestReport: fairestReport,
      reports: reportsWithIndicator,
    });
  } catch (error) {
    return NextResponse.json({ error: "Could not load product details." }, { status: 500 });
  }
}