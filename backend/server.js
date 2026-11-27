import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pool from "./db.js";
import authRouter from "./routes/auth.js";
import adminRouter from "./routes/admin.js";
import locationsRouter from "./routes/locations.js";
import vehiclesRouter from "./routes/vehicles.js";
import bookingsRouter from "./routes/bookings.js";
import { apiNotFound, errorHandler } from "./lib/http.js";

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;
if (isProduction && !sessionSecret) {
  throw new Error("SESSION_SECRET wajib diatur pada environment production.");
}

const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin tidak diizinkan oleh CORS."));
  },
  credentials: true,
}));

// Reject browser form/fetch requests from unconfigured origins (CSRF defense).
app.use((req, res, next) => {
  const isReadOnly = ["GET", "HEAD", "OPTIONS"].includes(req.method);
  const origin = req.get("origin");
  if (!isReadOnly && origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      error: { code: "ORIGIN_NOT_ALLOWED", message: "Origin permintaan tidak diizinkan." },
    });
  }
  return next();
});

app.use(express.json());

if (isProduction) app.set("trust proxy", 1);
const PgSessionStore = connectPgSimple(session);
app.use(session({
  name: "rentgo.sid",
  secret: sessionSecret || "rent-go-development-only-change-this-secret",
  store: new PgSessionStore({
    pool,
    tableName: "user_sessions",
    createTableIfMissing: false,
    pruneSessionInterval: 15 * 60,
  }),
  resave: false,
  saveUninitialized: false,
  rolling: true,
  proxy: isProduction,
  cookie: {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE === "true" || isProduction,
    sameSite: process.env.SESSION_SAME_SITE || "lax",
    path: "/",
    maxAge: 8 * 60 * 60 * 1000,
  },
}));

// Tes server dan koneksi database
app.get("/", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.send("Backend Rent-Go aktif dan PostgreSQL terhubung!");
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).send("Backend aktif, tetapi database gagal terhubung.");
  }
});

app.use("/api", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/locations", locationsRouter);
app.use("/api/vehicles", vehiclesRouter);
app.use("/api/bookings", bookingsRouter);

app.use("/api", apiNotFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, async () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);

  try {
    await pool.query("SELECT 1");
    console.log("Koneksi PostgreSQL berhasil.");
  } catch (error) {
    console.error("Koneksi PostgreSQL gagal:", error.message);
  }
});
