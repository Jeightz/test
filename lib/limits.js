import { query } from "./db";

export const MAX_REPORTS_PER_DAY = 5;
export const MAX_RATINGS_PER_DAY = 10;

export async function countTodayActions(sessionId, action) {
  const result = await query(
    `SELECT COUNT(*)::int AS total
     FROM device_log
     WHERE session_id = $1
       AND action = $2
       AND action_date::date = CURRENT_DATE`,
    [sessionId, action]
  );

  return result.rows[0].total;
}

export async function logAction(sessionId, action) {
  await query("INSERT INTO device_log (session_id, action) VALUES ($1, $2)", [
    sessionId,
    action,
  ]);
}
