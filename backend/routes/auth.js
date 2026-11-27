import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const publicUser = ({ id, nama, email, role }) => ({ id, nama, email, role });

function regenerateSession(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate((error) => error ? reject(error) : resolve());
  });
}

router.post("/register", async (req, res) => {
  const { nama, email, password } = req.body ?? {};
  if (
    typeof nama !== "string" || typeof email !== "string" || typeof password !== "string" ||
    !nama.trim() || !email.trim() || !password
  ) {
    return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
  }

  const cleanName = nama.trim();
  const cleanEmail = email.trim().toLowerCase();
  if (cleanName.length > 100 || cleanEmail.length > 100) {
    return res.status(400).json({ message: "Nama dan email maksimal 100 karakter." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ message: "Format email tidak valid." });
  }
  if (Buffer.byteLength(password, "utf8") > 72) {
    return res.status(400).json({ message: "Password terlalu panjang." });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      `INSERT INTO "daftar_akun" (nama, email, pw, role)
       VALUES ($1, $2, $3, 'client')
       RETURNING id, nama, email, role`,
      [cleanName, cleanEmail, passwordHash]
    );
    return res.status(201).json({ message: "Registrasi berhasil. Silakan login.", user: rows[0] });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email sudah terdaftar." });
    }
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

  try {
    const { rows } = await pool.query(
      `SELECT id, nama, email, pw, role FROM "daftar_akun" WHERE LOWER(email) = $1`,
      [email.trim().toLowerCase()]
    );
    const account = rows[0];
    if (!account || !(await bcrypt.compare(password, account.pw))) {
      return res.status(401).json({ message: "Email atau password salah." });
    }

    // Rotate the session identifier after authentication to prevent session fixation.
    await regenerateSession(req);
    req.session.userId = account.id;
    return res.status(200).json({ message: "Login berhasil.", user: publicUser(account) });
  } catch {
    return res.status(500).json({ message: "Terjadi kesalahan pada server." });
  }
});

router.post("/logout", (req, res, next) => {
  if (!req.session) return res.sendStatus(204);
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie("rentgo.sid", {
      httpOnly: true,
      secure: process.env.SESSION_COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
      sameSite: process.env.SESSION_SAME_SITE || "lax",
      path: "/",
    });
    return res.sendStatus(204);
  });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
