import { NextResponse } from "next/server";
import { getClient } from "../../../lib/db";
import { getOrCreateSession } from "../../../lib/session";
import {
  MAX_REPORTS_PER_DAY,
  countTodayActions,
} from "../../../lib/limits";
import cloudinary from "../../../lib/cloudinary";

function parseNumber(value) {
  if (value == null || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function collectMissing({
  productName,
  categoryId,
  price,
  barangay,
  city,
  country,
  latitude,
  longitude,
  photo,
}) {
  const missing = [];
  if (!productName) missing.push("product name");
  if (!categoryId) missing.push("category");
  if (price == null || price <= 0) missing.push("price");
  if (!barangay) missing.push("barangay/village");
  if (!city) missing.push("city/municipality");
  if (!country) missing.push("country");
  if (latitude == null) missing.push("latitude");
  if (longitude == null) missing.push("longitude");
  if (!photo || typeof photo === "string" || photo.size === 0) {
    missing.push("captured photo");
  }
  return missing;
}

// --- Cloudinary upload with timeout + retry ---
function uploadToCloudinary(buffer, { timeoutMs = 15000 } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(
        Object.assign(new Error("Cloudinary upload timed out"), {
          code: "UPLOAD_TIMEOUT",
        })
      );
    }, timeoutMs);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "priceter/reports",
        resource_type: "image",
        timeout: timeoutMs, // cloudinary's own internal timeout too
      },
      (error, result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);

        if (error) {
          console.error("Cloudinary error:", error);
          reject(
            Object.assign(new Error("Cloudinary upload failed"), {
              code: error.code || "UPLOAD_FAILED",
              cause: error,
            })
          );
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      console.error("Cloudinary stream error:", err);
      reject(
        Object.assign(new Error("Cloudinary stream error"), {
          code: "STREAM_ERROR",
          cause: err,
        })
      );
    });

    uploadStream.end(buffer);
  });
}

async function uploadWithRetry(buffer, retries = 2) {
  let lastError;

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const result = await uploadToCloudinary(buffer);
      if (attempt > 1) {
        console.log(`✅ Cloudinary upload succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (err) {
      lastError = err;
      console.error(
        `Cloudinary upload attempt ${attempt} failed:`,
        err.code || err.message
      );

      // Only retry on transient network errors, not on things like bad file type
      const retryable = ["ETIMEDOUT", "UPLOAD_TIMEOUT", "ECONNRESET", "STREAM_ERROR"];
      const isRetryable =
        retryable.includes(err.code) ||
        retryable.includes(err.cause?.code);

      if (!isRetryable || attempt === retries + 1) {
        break;
      }

      // small backoff before retrying
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }

  throw lastError;
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
    const categoryId = parseNumber(formData.get("category_id"));
    const price = parseNumber(formData.get("price"));
    const barangay = String(formData.get("barangay") || "").trim();
    const city = String(formData.get("city") || "").trim();
    const country = String(formData.get("country") || "").trim();
    const latitude = parseNumber(formData.get("latitude"));
    const longitude = parseNumber(formData.get("longitude"));
    const photo = formData.get("photo");

    console.log("Product:", productName);
    console.log("Price:", price);
    console.log("Barangay:", barangay);
    console.log("City:", city);
    console.log("Country:", country);
    console.log("Latitude:", latitude);
    console.log("Longitude:", longitude);

    if (photo) {
      console.log("Photo type:", photo.type);
      console.log("Photo size:", photo.size);
      console.log("Photo name:", photo.name);
    } else {
      console.log("Photo: NONE");
    }

    const missing = collectMissing({
      productName,
      categoryId,
      price,
      barangay,
      city,
      country,
      latitude,
      longitude,
      photo,
    });

    if (missing.length > 0) {
      console.error(missing);
      return NextResponse.json(
        {
          error: `Report was not saved. Missing or invalid: ${missing.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    if (photo.type && !allowedTypes.includes(photo.type)) {
      console.error(photo.type);
      return NextResponse.json(
        { error: "Photo must be a JPG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    // --- Cloudinary upload, isolated error handling ---
    let photoUrl;
    try {
      const buffer = Buffer.from(await photo.arrayBuffer());
      const uploadResult = await uploadWithRetry(buffer, 2);
      photoUrl = uploadResult.secure_url;
      console.log("✅ Cloudinary upload successful:", photoUrl);
    } catch (uploadError) {
      console.error("❌ Cloudinary upload failed permanently:", uploadError);
      return NextResponse.json(
        {
          error:
            "We couldn't upload your photo right now (connection to the image server timed out). Please check your internet connection and try again.",
        },
        { status: 502 } // Bad Gateway: upstream (Cloudinary) failure
      );
    }

    // --- Database transaction, isolated error handling ---
    try {
      client = await getClient();
      console.log("✅ PostgreSQL client connected");

      await client.query("BEGIN");
      console.log("✅ Transaction started");

      console.log("🔎 Looking for product...");

      let product = await client.query(
        `SELECT product_id
         FROM product
         WHERE LOWER(name) = LOWER($1)`,
        [productName]
      );

      if (!product.rows[0]) {
        console.log("Product does not exist. Creating...");

        const categoryResult = await client.query(
          `SELECT category_id
           FROM category
           WHERE category_id = $1`,
          [categoryId]
        );

        if (!categoryResult.rows[0]) {
          throw new Error("Selected category does not exist.");
        }

        product = await client.query(
          `INSERT INTO product
            (name, category_id)
           VALUES ($1, $2)
           RETURNING product_id`,
          [productName, categoryResult.rows[0].category_id]
        );
      } else {
        console.log(product.rows[0].product_id);
      }

      const address = await client.query(
        `INSERT INTO address
          (barangay, city, country, longitude, latitude)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING address_id`,
        [barangay, city, country, longitude, latitude]
      );

      const report = await client.query(
        `INSERT INTO report
          (address_id, session_id, product_id, price, photo_url)
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

      await client.query(
        `INSERT INTO device_log (session_id, action)
         VALUES ($1, $2)`,
        [session.session_id, "report"]
      );

      await client.query("COMMIT");

      const remainingReports = MAX_REPORTS_PER_DAY - used - 1;

      return NextResponse.json({
        ok: true,
        reportId: report.rows[0].report_id,
        productId: report.rows[0].product_id,
        remainingReports,
        message: `Anonymous price report saved. This device can submit ${remainingReports} more report${
          remainingReports === 1 ? "" : "s"
        } today.`,
      });
    } catch (dbError) {
      if (client) {
        try {
          await client.query("ROLLBACK");
          console.log("↩️ Database transaction rolled back");
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError?.message);
        }
      }

      console.error("❌ Database error:", dbError);

      // Note: photo was already uploaded to Cloudinary at this point but the
      // DB row wasn't saved. Consider cleaning up the orphaned image here,
      // e.g. cloudinary.uploader.destroy(uploadResult.public_id).

      return NextResponse.json(
        {
          error:
            dbError.message === "Selected category does not exist."
              ? "Selected category does not exist."
              : "The report could not be saved due to a database error. Please try again.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Unexpected error in /api/reports:", error);
    return NextResponse.json(
      { error: "The report could not be saved. Please try again." },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}