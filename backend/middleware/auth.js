import pool from "../db.js";

/** Resolve the account on every request so role changes take effect immediately. */
export async function requireAuth(req, res, next) {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "Silakan login terlebih dahulu." },
      });
    }

    const { rows } = await pool.query(
      `SELECT id, nama, email, role FROM "daftar_akun" WHERE id = $1`,
      [userId]
    );
    if (!rows[0]) {
      req.session.destroy(() => {});
      return res.status(401).json({
        error: { code: "UNAUTHENTICATED", message: "Sesi tidak lagi berlaku. Silakan login kembali." },
      });
    }

    req.user = rows[0];
    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireRole(...roles) {
  return [requireAuth, (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Anda tidak memiliki akses ke fitur ini." },
      });
    }
    return next();
  }];
}
