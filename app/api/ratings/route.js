import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { getOrCreateSession } from "../../../lib/session";
import {
  MAX_RATINGS_PER_DAY,
  countTodayActions,
  logAction,
} from "../../../lib/limits";

export async function POST(request) {
  try {
    const session = await getOrCreateSession();
    let body;

    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "The rating could not be read. Please try again." },
        { status: 400 }
      );
    }

    const reportId = Number(body.report_id);
    const rating = Number(body.rating);
    const description = String(body.description || "").trim();

    if (!Number.isInteger(reportId) || reportId <= 0) {
      return NextResponse.json(
        { error: "A valid report is required before a rating can be saved." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Choose a whole-number consistency rating from 1 to 5." },
        { status: 400 }
      );
    }

    if (description.length > 255) {
      return NextResponse.json(
        { error: "The reason must be 255 characters or fewer." },
        { status: 400 }
      );
    }

    const report = await query("SELECT report_id FROM report WHERE report_id = $1", [reportId]);
    if (!report.rows[0]) {
      return NextResponse.json(
        { error: "That price report was not found, so the rating was not saved." },
        { status: 404 }
      );
    }

    const existing = await query(
      "SELECT trust_id FROM trust_rating WHERE report_id = $1 AND session_id = $2",
      [reportId, session.session_id]
    );

    if (existing.rows[0]) {
      return NextResponse.json(
        { error: "This device already rated this report. Duplicate ratings are not saved." },
        { status: 409 }
      );
    }

    const used = await countTodayActions(session.session_id, "rating");
    if (used >= MAX_RATINGS_PER_DAY) {
      return NextResponse.json(
        {
          error: `Daily anonymous rating limit reached (${MAX_RATINGS_PER_DAY} per device). Try again tomorrow.`,
        },
        { status: 429 }
      );
    }

    await query(
      `INSERT INTO trust_rating (report_id, session_id, rating, description)
       VALUES ($1, $2, $3, $4)`,
      [reportId, session.session_id, rating, description || null]
    );

    await logAction(session.session_id, "rating");
    const remaining = MAX_RATINGS_PER_DAY - used - 1;

    return NextResponse.json({
      ok: true,
      message: `Anonymous consistency rating saved. This device can submit ${remaining} more rating${remaining === 1 ? "" : "s"} today.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "The rating could not be saved. Please try again." },
      { status: 500 }
    );
  }
}
