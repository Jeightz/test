import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;


if (databaseUrl) {
  try {
    const parsed = new URL(databaseUrl);

  } catch (error) {
    console.error(" Invalid DATABASE_URL:", error);
  }
}


const pool = new Pool({
  connectionString: databaseUrl,
});


export async function query(text, params) {

  try {
    const result = await pool.query(text, params);



    return result;
  } catch (error) {
 
    throw error;
  }
}

export async function getClient() {

  try {
    const client = await pool.connect();

 
    return client;
  } catch (error) {
 
    throw error;
  }
}