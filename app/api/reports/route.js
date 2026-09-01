
import { NextResponse } from "next/server";
import { getClient } from "../../../lib/db";
import { getOrCreateSession } from "../../../lib/session";
import {
  MAX_REPORTS_PER_DAY,
  countTodayActions,
} from "../../../lib/limits";
import cloudinary from "../../../lib/cloudinary";

// ========================================
// PARSE NUMBER
// ========================================

function parseNumber(value) {
  if (value == null || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? null : parsed;
}

// ========================================
// CHECK MISSING FIELDS
// ========================================

function collectMissing({
  productName,
  price,
  barangay,
  city,
  country,
  latitude,
  longitude,
  photo,
}) {
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

// ========================================
// POST /api/reports
// ========================================

export async function POST(request) {
  let client;

  try {
    // ========================================
    // 1. GET / CREATE SESSION
    // ========================================

    console.log("========================================");
    console.log("📋 POST /api/reports");
    console.log("========================================");

    console.log("🔐 Getting session...");

    const session = await getOrCreateSession();

    console.log("✅ Session:", session.session_id);

    // ========================================
    // 2. CHECK DAILY REPORT LIMIT
    // ========================================

    console.log("🔎 Checking daily report limit...");

    const used = await countTodayActions(
      session.session_id,
      "report"
    );

    console.log("Reports used today:", used);
    console.log("Maximum reports:", MAX_REPORTS_PER_DAY);

    if (used >= MAX_REPORTS_PER_DAY) {
      return NextResponse.json(
        {
          error: `Daily anonymous report limit reached (${MAX_REPORTS_PER_DAY} per device). The report was not saved. Try again tomorrow.`,
        },
        {
          status: 429,
        }
      );
    }

    // ========================================
    // 3. READ FORM DATA
    // ========================================

    console.log("📦 Reading form data...");

    const formData = await request.formData();

    const productName = String(
      formData.get("product_name") || ""
    ).trim();

    const price = parseNumber(
      formData.get("price")
    );

    const barangay = String(
      formData.get("barangay") || ""
    ).trim();

    const city = String(
      formData.get("city") || ""
    ).trim();

    const country = String(
      formData.get("country") || ""
    ).trim();

    const latitude = parseNumber(
      formData.get("latitude")
    );

    const longitude = parseNumber(
      formData.get("longitude")
    );

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

    // ========================================
    // 4. VALIDATE REQUIRED FIELDS
    // ========================================

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

    if (missing.length > 0) {
      console.error(
        "❌ Missing fields:",
        missing
      );

      return NextResponse.json(
        {
          error: `Report was not saved. Missing or invalid: ${missing.join(
            ", "
          )}.`,
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // 5. VALIDATE PHOTO TYPE
    // ========================================

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
    ];

    if (
      photo.type &&
      !allowedTypes.includes(photo.type)
    ) {
      console.error(
        "❌ Invalid photo type:",
        photo.type
      );

      return NextResponse.json(
        {
          error:
            "Photo must be a JPG, PNG, or WEBP image.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // 6. UPLOAD PHOTO TO CLOUDINARY
    // ========================================

    console.log("========================================");
    console.log("☁️ CLOUDINARY UPLOAD");
    console.log("========================================");

    const buffer = Buffer.from(
      await photo.arrayBuffer()
    );

    console.log(
      "Photo converted to buffer"
    );

    console.log(
      "Buffer size:",
      buffer.length
    );

    const uploadResult = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "priceter/reports",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                console.error(
                  "❌ Cloudinary upload failed"
                );

                console.error(
                  "Cloudinary error:",
                  error
                );

                reject(error);
              } else {
                console.log(
                  "✅ Cloudinary upload successful"
                );

                resolve(result);
              }
            }
          );

        uploadStream.end(buffer);
      }
    );

    const photoUrl =
      uploadResult.secure_url;

    console.log(
      "Cloudinary photo URL:",
      photoUrl
    );

    // ========================================
    // 7. CONNECT TO DATABASE
    // ========================================

    console.log("========================================");
    console.log("🗄️ DATABASE");
    console.log("========================================");

    client = await getClient();

    console.log(
      "✅ PostgreSQL client connected"
    );

    await client.query("BEGIN");

    console.log(
      "✅ Transaction started"
    );

    // ========================================
    // 8. FIND EXISTING PRODUCT
    // ========================================

    console.log(
      "🔎 Looking for product..."
    );

    let product = await client.query(
      `SELECT product_id
       FROM product
       WHERE LOWER(name) = LOWER($1)`,
      [productName]
    );

    // ========================================
    // 9. CREATE PRODUCT IF NEEDED
    // ========================================

    if (!product.rows[0]) {
      console.log(
        "Product does not exist. Creating..."
      );

      const uncategorized =
        await client.query(
          `SELECT category_id
           FROM category
           WHERE name = 'Uncategorized'`
        );

      if (!uncategorized.rows[0]) {
        throw new Error(
          "Uncategorized category is missing."
        );
      }

      product = await client.query(
        `INSERT INTO product
          (name, category_id)
         VALUES ($1, $2)
         RETURNING product_id`,
        [
          productName,
          uncategorized.rows[0]
            .category_id,
        ]
      );

      console.log(
        "✅ Product created:",
        product.rows[0].product_id
      );
    } else {
      console.log(
        "✅ Existing product:",
        product.rows[0].product_id
      );
    }

    // ========================================
    // 10. CREATE ADDRESS
    // ========================================

    console.log(
      "📍 Creating address..."
    );

    const address = await client.query(
      `INSERT INTO address
        (
          barangay,
          city,
          country,
          longitude,
          latitude
        )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING address_id`,
      [
        barangay,
        city,
        country,
        longitude,
        latitude,
      ]
    );

    console.log(
      "✅ Address created:",
      address.rows[0].address_id
    );

    // ========================================
    // 11. CREATE REPORT
    // ========================================

    console.log(
      "📝 Creating report..."
    );

    const report = await client.query(
      `INSERT INTO report
        (
          address_id,
          session_id,
          product_id,
          price,
          photo_url
        )
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

    console.log(
      "✅ Report created:",
      report.rows[0].report_id
    );

    // ========================================
    // 12. LOG DEVICE ACTION
    // ========================================

    console.log(
      "📊 Logging device action..."
    );

    await client.query(
      `INSERT INTO device_log
        (session_id, action)
       VALUES ($1, $2)`,
      [
        session.session_id,
        "report",
      ]
    );

    console.log(
      "✅ Device action logged"
    );

    // ========================================
    // 13. COMMIT TRANSACTION
    // ========================================

    await client.query("COMMIT");

    console.log(
      "✅ Transaction committed"
    );

    // ========================================
    // 14. SUCCESS RESPONSE
    // ========================================

    const remainingReports =
      MAX_REPORTS_PER_DAY -
      used -
      1;

    console.log("========================================");
    console.log(
      "🎉 REPORT SAVED SUCCESSFULLY"
    );
    console.log("Report ID:", report.rows[0].report_id);
    console.log(
      "Product ID:",
      report.rows[0].product_id
    );
    console.log(
      "Remaining reports:",
      remainingReports
    );
    console.log("========================================");

    return NextResponse.json({
      ok: true,

      reportId:
        report.rows[0].report_id,

      productId:
        report.rows[0].product_id,

      remainingReports,

      message: `Anonymous price report saved. This device can submit ${remainingReports} more report${
        remainingReports === 1
          ? ""
          : "s"
      } today.`,
    });
  } catch (error) {
    // ========================================
    // ERROR
    // ========================================

    console.error("========================================");
    console.error("❌ REPORT API FAILED");
    console.error("========================================");

    console.error(
      "Error name:",
      error?.name
    );

    console.error(
      "Error message:",
      error?.message
    );

    console.error(
      "Error code:",
      error?.code
    );

    console.error(
      "Error detail:",
      error?.detail
    );

    console.error(
      "Error hint:",
      error?.hint
    );

    console.error(
      "Full error:",
      error
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error("========================================");

    // ========================================
    // ROLLBACK DATABASE TRANSACTION
    // ========================================

    if (client) {
      try {
        await client.query("ROLLBACK");

        console.log(
          "↩️ Database transaction rolled back"
        );
      } catch (rollbackError) {
        console.error(
          "❌ Rollback failed:",
          rollbackError?.message
        );
      }
    }

    // ========================================
    // ERROR RESPONSE
    // ========================================

    return NextResponse.json(
      {
        error:
          "The report could not be saved. Please try again.",
      },
      {
        status: 500,
      }
    );
  } finally {
    // ========================================
    // RELEASE DATABASE CLIENT
    // ========================================

    if (client) {
      client.release();

      console.log(
        "🔌 PostgreSQL client released"
      );
    }
  }
}

