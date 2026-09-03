import { NextResponse } from "next/server";
import { query } from "../../../lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT category_id, name
       FROM category
       ORDER BY
         CASE
           WHEN name = 'Uncategorized' THEN 1
           ELSE 0
         END,
         name`
    );
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not load categories." },
      { status: 500 }
    );
  }
}