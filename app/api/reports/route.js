import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getClient } from "../../../lib/db";
import { getOrCreateSession } from "../../../lib/session";
import {
  MAX_REPORTS_PER_DAY,
  countTodayActions,
} from "../../../lib/limits";

function parseNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function collectMissing({ productName, price, barangay, city, country, latitude, longitude, photo }) {
  const missing = [];

  if (!productName) {
    missing.push("product name");
  }
  if (price == null || price <= 0) {
    missing.push("price");
  }
  if (!barangay) {
    missing.push("barangay/village");
  }
  if (!city) {
    missing.push("city/municipality");
  }
  if (!country) {
    missing.push("country");
  }
  if (latitude == null) {
    missing.push("latitude");
  }
  if (longitude == null) {
    missing.push("longitude");
  }
  if (!photo || typeof photo === "string" || photo.size === 0) {
    missing.push("captured photo");
  }

  return missing;
}

export async function POST(request) {
  let client;

  try {
    const session = await getOrCreateSession();
    const used = await countTodayActions(session.session_id, "report");

    if (used >= MAX_REPORTS_PER_DAY) {
      return NextResponse.json(
        {
          error: `Daily anonymous report limit reached (${MAX_REPORTS_PER_DAY} per device). The report was not saved. Try again tomorrow.`,
        },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const productName = String(formData.get("product_name") || "").trim();
    const price = parseNumber(formData.get("price"));
    const barangay = String(formData.get("barangay") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const latitude = parseNumber(formData.get("latitude"));
    const longitude = parseNumber(formData.get("longitude"));
    const photo = formData.get("photo");

    const missing = collectMissing({
      productName,
      price,
      barangay,
      city,
      country,
      latitude,
      longitude,
      photo,
    });

    if (missing.length) {
      return NextResponse.json(
        { error: `Report was not saved. Missing or invalid: ${missing.join(", ")}.` },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (photo.type && !allowedTypes.includes(photo.type)) {
      return NextResponse.json({ error: "Photo must be a JPG, PNG, or WEBP image." }, { status: 400 });
    }

    const extension = path.extname(photo.name || "").toLowerCase() || ".jpg";
    const fileName = `${Date.now()}-${session.session_id}${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await photo.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), buffer);
    const photoUrl = `/uploads/${fileName}`;

    client = await getClient();
    await client.query("BEGIN");

    let product = await client.query(
      "SELECT product_id FROM product WHERE LOWER(name) = LOWER($1)",
      [productName]
    );

    if (!product.rows[0]) {
      const uncategorized = await client.query(
        "SELECT category_id FROM category WHERE name = 'Uncategorized'"
      );

      if (!uncategorized.rows[0]) {
        throw new Error("Uncategorized category is missing.");
      }

      product = await client.query(
        "INSERT INTO product (name, category_id) VALUES ($1, $2) RETURNING product_id",
        [productName, uncategorized.rows[0].category_id]
      );
    }

    const address = await client.query(
      `INSERT INTO address (barangay, city, country, longitude, latitude)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING address_id`,
      [barangay, city, country, longitude, latitude]
    );

    const report = await client.query(
      `INSERT INTO report (address_id, session_id, product_id, price, photo_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING report_id, product_id`,
      [
        address.rows[0].address_id,
        session.session_id,
        product.rows[0].product_id,
        price,
        photoUrl,
      ]
    );

    await client.query("INSERT INTO device_log (session_id, action) VALUES ($1, $2)", [
      session.session_id,
      "report",
    ]);

    await client.query("COMMIT");

    return NextResponse.json({
      ok: true,
      reportId: report.rows[0].report_id,
      productId: report.rows[0].product_id,
      remainingReports: MAX_REPORTS_PER_DAY - used - 1,
      message: `Anonymous price report saved. This device can submit ${MAX_REPORTS_PER_DAY - used - 1} more report${MAX_REPORTS_PER_DAY - used - 1 === 1 ? "" : "s"} today.`,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        // Ignore rollback errors so the original error can be returned.
      }
    }

    return NextResponse.json({ error: "The report could not be saved. Please try again." }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}
