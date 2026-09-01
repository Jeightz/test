import { NextResponse } from "next/server";
import { getOrCreateSession } from "../../../lib/session";

export async function GET() {
  try {
    const session = await getOrCreateSession();
    return NextResponse.json({ ok: true, sessionId: session.session_id });
  } catch (error) {
    return NextResponse.json(
      { error: "Could not create anonymous session. Check the database connection." },
      { status: 500 }
    );
  }
}
