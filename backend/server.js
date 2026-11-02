
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import pool from "./db.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
}));

app.use(express.json());

// Tes server dan koneksi database
app.get("/", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.send("Backend Rent-Go aktif dan PostgreSQL terhubung!");
  } catch (error) {
    console.error("Database error:", error.message);
    res.status(500).send("Backend aktif, tetapi database gagal terhubung.");
  }
});

// ==========================
// REGISTRASI
// POST /api/register
// ==========================
app.post("/api/register", async (req, res) => {
  try {
    const { nama, email, password } = req.body ?? {};

    if (
      typeof nama !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !nama.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Nama, email, dan password wajib diisi.",
      });
    }

    const namaBersih = nama.trim();
    const emailBersih = email.trim().toLowerCase();

    if (namaBersih.length > 100 || emailBersih.length > 100) {
      return res.status(400).json({
        message: "Nama dan email maksimal 100 karakter.",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailBersih)) {
      return res.status(400).json({
        message: "Format email tidak valid.",
      });
    }

    // Batas input bcrypt: 72 byte
    if (Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        message: "Password terlalu panjang.",
      });
    }

    // Periksa email yang sudah terdaftar
    const cek = await pool.query(
      'SELECT id FROM "daftar_akun" WHERE LOWER(email) = $1',
      [emailBersih]
    );

    if (cek.rowCount > 0) {
      return res.status(409).json({
        message: "Email sudah terdaftar.",
      });
    }

    // Hash password sebelum disimpan
    const passwordHash = await bcrypt.hash(password, 10);

    // Masukkan akun ke tabel yang sudah ada
    const hasil = await pool.query(
      `INSERT INTO "daftar_akun" (nama, email, pw)
       VALUES ($1, $2, $3)
       RETURNING id, nama, email`,
      [namaBersih, emailBersih, passwordHash]
    );

    return res.status(201).json({
      message: "Registrasi berhasil. Silakan login.",
      user: hasil.rows[0],
    });
  } catch (error) {
    console.error("Registrasi error:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email sudah terdaftar.",
      });
    }

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
});

// ==========================
// LOGIN
// POST /api/login
// ==========================
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email dan password wajib diisi.",
      });
    }

    const emailBersih = email.trim().toLowerCase();

    const hasil = await pool.query(
      `SELECT id, nama, email, pw
       FROM "daftar_akun"
       WHERE LOWER(email) = $1`,
      [emailBersih]
    );

    if (hasil.rowCount === 0) {
      return res.status(404).json({
        message: "Akun belum terdaftar.",
      });
    }

    const akun = hasil.rows[0];

    const cocok = await bcrypt.compare(password, akun.pw);

    if (!cocok) {
      return res.status(401).json({
        message: "Email atau password salah.",
      });
    }

    return res.status(200).json({
      message: "Login berhasil.",
      user: {
        id: akun.id,
        nama: akun.nama,
        email: akun.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Terjadi kesalahan pada server.",
    });
  }
});

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
