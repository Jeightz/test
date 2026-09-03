import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { nearbyDistanceSql } from "../../../lib/location";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const nearby = searchParams.get("nearby") === "1";

  try {
    if (nearby && lat && lng) {
      const distance = nearbyDistanceSql("$2", "$3");
      const result = await query(
        `SELECT DISTINCT p.product_id, p.name, c.name AS category_name,
                COUNT(r.report_id)::int AS report_count,
                (
                  SELECT photo_url FROM report
                  WHERE product_id = p.product_id
                  ORDER BY date_reported DESC
                  LIMIT 1
                ) AS photo_url,
                (
                  SELECT price FROM report
                  WHERE product_id = p.product_id
                  ORDER BY date_reported DESC
                  LIMIT 1
                ) AS latest_price,
                (
                  SELECT price FROM srp
                  WHERE product_id = p.product_id
                  ORDER BY effective_date DESC, srp_id DESC
                  LIMIT 1
                ) AS srp_price,
                (
                  SELECT a2.latitude FROM report r2
                  JOIN address a2 ON a2.address_id = r2.address_id
                  WHERE r2.product_id = p.product_id
                    AND a2.latitude IS NOT NULL
                    AND a2.longitude IS NOT NULL
                  ORDER BY r2.date_reported DESC
                  LIMIT 1
                ) AS latitude,
                (
                  SELECT a2.longitude FROM report r2
                  JOIN address a2 ON a2.address_id = r2.address_id
                  WHERE r2.product_id = p.product_id
                    AND a2.latitude IS NOT NULL
                    AND a2.longitude IS NOT NULL
                  ORDER BY r2.date_reported DESC
                  LIMIT 1
                ) AS longitude
         FROM product p
         JOIN category c ON c.category_id = p.category_id
         JOIN report r ON r.product_id = p.product_id
         JOIN address a ON a.address_id = r.address_id
         WHERE ($1 = '' OR p.name ILIKE '%' || $1 || '%')
           AND a.latitude IS NOT NULL
           AND a.longitude IS NOT NULL
           AND ${distance} <= 5
         GROUP BY p.product_id, p.name, c.name
         ORDER BY p.name`,
        [q, Number(lat), Number(lng)]
      );
      return NextResponse.json({ products: result.rows });
    }

    const result = await query(
      `SELECT p.product_id, p.name, c.name AS category_name,
              COUNT(r.report_id)::int AS report_count,
              (
                SELECT photo_url FROM report
                WHERE product_id = p.product_id
                ORDER BY date_reported DESC
                LIMIT 1
              ) AS photo_url,
              (
                SELECT price FROM report
                WHERE product_id = p.product_id
                ORDER BY date_reported DESC
                LIMIT 1
              ) AS latest_price,
              (
                SELECT price FROM srp
                WHERE product_id = p.product_id
                ORDER BY effective_date DESC, srp_id DESC
                LIMIT 1
              ) AS srp_price,
              (
                SELECT a2.latitude FROM report r2
                JOIN address a2 ON a2.address_id = r2.address_id
                WHERE r2.product_id = p.product_id
                  AND a2.latitude IS NOT NULL
                  AND a2.longitude IS NOT NULL
                ORDER BY r2.date_reported DESC
                LIMIT 1
              ) AS latitude,
              (
                SELECT a2.longitude FROM report r2
                JOIN address a2 ON a2.address_id = r2.address_id
                WHERE r2.product_id = p.product_id
                  AND a2.latitude IS NOT NULL
                  AND a2.longitude IS NOT NULL
                ORDER BY r2.date_reported DESC
                LIMIT 1
              ) AS longitude
       FROM product p
       JOIN category c ON c.category_id = p.category_id
       LEFT JOIN report r ON r.product_id = p.product_id
       WHERE ($1 = '' OR p.name ILIKE '%' || $1 || '%')
       GROUP BY p.product_id, p.name, c.name
       ORDER BY p.name`,
      [q]
    );

    return NextResponse.json({ products: result.rows });
  } catch (error) {
    return NextResponse.json({ error: "Could not search products." }, { status: 500 });
  }
}