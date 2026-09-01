import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { query } from "./db";

const COOKIE_NAME = "priceter_session";

export async function getOrCreateSession() {
  const cookieStore = await cookies();
  const existingToken = cookieStore.get(COOKIE_NAME)?.value;

  if (existingToken) {
    const found = await query(
      "UPDATE device_session SET datetime_seen = NOW() WHERE token = $1 RETURNING session_id, token",
      [existingToken]
    );

    if (found.rows[0]) {
      return found.rows[0];
    }
  }

  const token = randomUUID();
  const created = await query(
    "INSERT INTO device_session (token) VALUES ($1) RETURNING session_id, token",
    [token]
  );

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return created.rows[0];
}
