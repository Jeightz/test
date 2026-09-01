import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

console.log("========================================");
console.log("🔌 DATABASE CONFIG CHECK");
console.log("========================================");

console.log("DATABASE_URL exists:", !!databaseUrl);
console.log("DATABASE_URL type:", typeof databaseUrl);

if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);

    console.log("Database protocol:", parsed.protocol);
    console.log("Database username:", parsed.username);
    console.log("Database hostname:", parsed.hostname);
    console.log("Database port:", parsed.port);
    console.log("Database name:", parsed.pathname);
    console.log("Password exists:", !!parsed.password);
    console.log("Password length:", parsed.password.length);
    console.log("Password type:", typeof parsed.password);
  } catch (error) {
    console.error("❌ Invalid DATABASE_URL:", error);
  }
}

console.log("========================================");

const pool = new Pool({
  connectionString: databaseUrl,
});

pool.on("error", (error) => {
  console.error("🔥 PG POOL ERROR");
  console.error("Message:", error.message);
  console.error("Code:", error.code);
  console.error(error);
});

export async function query(text, params) {
  console.log("🟢 DB QUERY");
  console.log("SQL:", text);
  console.log("Params:", params);

  try {
    const result = await pool.query(text, params);

    console.log("✅ DB QUERY SUCCESS");
    console.log("Rows:", result.rowCount);

    return result;
  } catch (error) {
    console.error("❌ DB QUERY FAILED");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Hint:", error.hint);

    throw error;
  }
}

export async function getClient() {
  console.log("🔌 Getting PostgreSQL client...");

  try {
    const client = await pool.connect();

    console.log("✅ PostgreSQL client connected!");

    return client;
  } catch (error) {
    console.error("❌ PostgreSQL connection FAILED");
    console.error("Message:", error.message);
    console.error("Code:", error.code);
    console.error(error);

    throw error;
  }
}