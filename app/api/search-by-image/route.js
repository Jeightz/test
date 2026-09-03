import { NextResponse } from "next/server";
import { getClient } from "../../../lib/db";
import { getImageEmbedding, embeddingToVectorLiteral } from "../../../lib/embedding";

export const maxDuration = 30;

const SIMILARITY_THRESHOLD = 0.75;

export async function POST(request) {
  let client;

  try {
    const formData = await request.formData();
    const photo = formData.get("photo");

    if (!photo || typeof photo === "string" || photo.size === 0) {
      return NextResponse.json(
        { error: "Please provide a photo to search." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (photo.type && !allowedTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: "Photo must be a JPG, PNG, or WEBP image." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await photo.arrayBuffer());

    let embedding;
    try {
      embedding = await getImageEmbedding(buffer);
      console.log("✅ Search embedding generated");
    } catch (embedError) {
      console.error("❌ Search embedding failed:", embedError.message);
      return NextResponse.json(
        { error: "Could not analyze the image. Please try again." },
        { status: 502 }
      );
    }

    const vectorLiteral = embeddingToVectorLiteral(embedding);

    client = await getClient();

    const result = await client.query(
      `SELECT
         p.product_id,
         p.name,
         c.name AS category_name,
         r.price AS latest_price,
         r.photo_url,
         (SELECT COUNT(*) FROM report WHERE product_id = p.product_id) AS report_count,
         1 - (r.image_embedding <=> $1) AS similarity
       FROM report r
       JOIN product p ON p.product_id = r.product_id
       LEFT JOIN category c ON c.category_id = p.category_id
       WHERE r.image_embedding IS NOT NULL
       ORDER BY r.image_embedding <=> $1
       LIMIT 1`,
      [vectorLiteral]
    );

    const bestMatch = result.rows[0];

    if (!bestMatch || bestMatch.similarity < SIMILARITY_THRESHOLD) {
      console.log(
        "No close match. Best similarity:",
        bestMatch?.similarity ?? "none"
      );
      return NextResponse.json(
        { error: "No close match found for this image." },
        { status: 404 }
      );
    }

    console.log("✅ Match found:", bestMatch.product_id, bestMatch.similarity);

    return NextResponse.json({
      ok: true,
      match: bestMatch,
    });
  } catch (error) {
    console.error("❌ Search-by-image error:", error);
    return NextResponse.json(
      { error: "Something went wrong while searching." },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}