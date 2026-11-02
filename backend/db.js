
import pg from "pg";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: fileURLToPath(new URL("./.env", import.meta.url)),
});

const { Pool } = pg;

if (!process.env.DB_PASSWORD) {
  throw new Error("DB_PASSWORD belum terbaca. Periksa backend/.env");
}

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "Rent_Go",
});

pool.on("error", (error) => {
  console.error("Kesalahan PostgreSQL:", error.message);
});

export default pool;
