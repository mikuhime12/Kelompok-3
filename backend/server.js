
import express from "express";
import cors from "cors";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = 3000;

// Menyiapkan lokasi file akun.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fileAkun = path.join(__dirname, "data", "akun.json");

// Middleware untuk menerima JSON dan request dari frontend
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend Rent-Go aktif!");
});
// Endpoint login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  // Periksa apakah email dan password dikirim
  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      success: false,
      message: "Email dan password wajib diisi."
    });
  }

  try {
    // Membaca data akun dari file JSON
    const isiFile = fs.readFileSync(fileAkun, "utf8");
    const akun = JSON.parse(isiFile);

    // Cari akun berdasarkan email
    const pengguna = akun.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase()
    );

    // Jika email tidak ditemukan
    if (!pengguna) {
      return res.status(401).json({
        success: false,
        message: "Akun belum terdaftar."
      });
    }

    // Jika email ditemukan tetapi password salah
    if (pengguna.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Password salah."
      });
    }

    // Jika email dan password cocok
    return res.status(200).json({
      success: true,
      message: "Login berhasil."
    });
  } catch (error) {
    console.error("Kesalahan membaca data akun:", error);

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend berjalan di http://localhost:${PORT}`);
});
