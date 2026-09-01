import fs from "fs";
import path from "path";
import { Client } from "pg";

function loadEnvFile(fileName) {
  const filePath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").trim();
    }
  }
}

function databaseName(url) {
  return new URL(url).pathname.replace(/^\//, "");
}

function adminConnectionString(url) {
  const parsed = new URL(url);
  parsed.pathname = "/postgres";
  return parsed.toString();
}

async function runSqlFile(client, filePath) {
  const sql = fs.readFileSync(filePath, "utf8");
  await client.query(sql);
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Copy .env.example to .env.local and edit it.");
  }

  const dbName = databaseName(process.env.DATABASE_URL);
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dbName)) {
    throw new Error("DATABASE_URL database name must use letters, numbers, or underscore.");
  }

  const admin = new Client({ connectionString: adminConnectionString(process.env.DATABASE_URL) });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);

  if (!exists.rows[0]) {
    await admin.query(`CREATE DATABASE ${dbName}`);
    console.log(`Created database ${dbName}`);
  } else {
    console.log(`Database ${dbName} already exists.`);
  }

  await admin.end();

  const appDb = new Client({ connectionString: process.env.DATABASE_URL });
  await appDb.connect();
  await runSqlFile(appDb, path.join(process.cwd(), "db", "schema.sql"));
  await runSqlFile(appDb, path.join(process.cwd(), "db", "seed.sql"));
  await runSqlFile(appDb, path.join(process.cwd(), "db", "mock-test-data.sql"));
  await appDb.end();

  console.log("PRICETER database tables and seed data are ready.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
