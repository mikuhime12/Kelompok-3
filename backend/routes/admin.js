import { Router } from "express";
import pool from "../db.js";
import { requireRole } from "../middleware/auth.js";

const router = Router();
const ROLES = ["admin", "perental", "client"];
const toInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

router.use(requireRole("admin"));

// GET /api/admin/dashboard
router.get("/dashboard", async (_req, res) => {
  const [counts, recent, monthly] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE role = 'client')::int AS total_clients,
        COUNT(*) FILTER (WHERE role = 'perental')::int AS total_perentals,
        (SELECT COUNT(*)::int FROM bookings) AS total_bookings,
        (SELECT COUNT(*)::int FROM bookings WHERE status = 'ongoing') AS ongoing_bookings,
        (SELECT COALESCE(SUM(vl.stock), 0)::int
           FROM vehicle_locations vl
           JOIN vehicles v ON v.id = vl.vehicle_id
           JOIN locations l ON l.id = vl.location_id
          WHERE v.active = TRUE AND v.type IN ('car', 'luxury') AND l.active = TRUE)
          AS total_car_units,
        (SELECT GREATEST(
            COALESCE(SUM(vl.stock), 0) - COUNT(DISTINCT locks.id), 0
         )::int
           FROM vehicle_locations vl
           JOIN vehicles v ON v.id = vl.vehicle_id
           JOIN locations l ON l.id = vl.location_id
           LEFT JOIN vehicle_availability_locks locks
             ON locks.vehicle_id = vl.vehicle_id
            AND locks.location_id = vl.location_id
            AND locks.status = 'active'
            AND locks.pickup_at <= now() AND locks.return_at > now()
          WHERE v.active = TRUE AND v.type IN ('car', 'luxury') AND l.active = TRUE)
          AS available_car_units
      FROM "daftar_akun"`),
    pool.query(`
      SELECT b.id, b.status, b.customer_name, b.customer_phone, b.total,
             b.currency, b.created_at, b.pickup_at, b.return_at,
             v.slug AS vehicle_id, v.name AS vehicle_name,
             l.city AS location_city, a.id AS account_id
        FROM bookings b
        JOIN vehicles v ON v.id = b.vehicle_id
        JOIN locations l ON l.id = b.location_id
        LEFT JOIN "daftar_akun" a ON a.id = b.account_id
       ORDER BY b.created_at DESC
       LIMIT 10`),
    pool.query(`
      SELECT to_char(month_start, 'YYYY-MM') AS month,
             booking_count::int AS bookings,
             revenue::int AS revenue
        FROM (
          SELECT date_trunc('month', created_at) AS month_start,
                 COUNT(*) AS booking_count,
                 COALESCE(SUM(total) FILTER (WHERE status <> 'cancelled'), 0) AS revenue
            FROM bookings
           WHERE created_at >= date_trunc('month', now()) - interval '5 months'
           GROUP BY 1
        ) monthly_bookings
       ORDER BY month_start`),
  ]);

  const row = counts.rows[0];
  res.json({
    data: {
      totals: {
        clients: row.total_clients,
        perentals: row.total_perentals,
        cars: row.total_car_units,
        availableCars: row.available_car_units,
        bookings: row.total_bookings,
        ongoingRentals: row.ongoing_bookings,
      },
      recentRentals: recent.rows,
      monthlyStatistics: monthly.rows,
    },
  });
});

// GET /api/admin/users?role=client|perental|admin&page=1&limit=20
router.get("/users", async (req, res) => {
  const page = toInt(req.query.page, 1, 1_000_000);
  const limit = toInt(req.query.limit, 20, 100);
  const role = typeof req.query.role === "string" ? req.query.role : "";
  if (role && !ROLES.includes(role)) {
    return res.status(400).json({
      error: { code: "INVALID_ROLE", message: "Role harus admin, perental, atau client." },
    });
  }

  const values = role ? [role] : [];
  const where = role ? "WHERE role = $1" : "";
  const count = await pool.query(`SELECT COUNT(*)::int AS total FROM "daftar_akun" ${where}`, values);
  const offset = (page - 1) * limit;
  const list = await pool.query(
    `SELECT id, nama, email, role, phone, created_at
       FROM "daftar_akun" ${where}
      ORDER BY created_at DESC, id DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, limit, offset]
  );
  return res.json({
    data: list.rows,
    meta: { page, limit, total: count.rows[0].total, totalPages: Math.ceil(count.rows[0].total / limit) },
  });
});

// PATCH /api/admin/users/:id/role
router.patch("/users/:id/role", async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body ?? {};
  if (!Number.isSafeInteger(id) || id < 1 || !ROLES.includes(role)) {
    return res.status(400).json({
      error: { code: "INVALID_USER_OR_ROLE", message: "ID pengguna atau role tidak valid." },
    });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const target = await client.query(
      `SELECT id, role FROM "daftar_akun" WHERE id = $1 FOR UPDATE`,
      [id]
    );
    if (!target.rows[0]) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: { code: "USER_NOT_FOUND", message: "Pengguna tidak ditemukan." } });
    }

    if (target.rows[0].role === "admin" && role !== "admin") {
      const admins = await client.query(
        `SELECT id FROM "daftar_akun" WHERE role = 'admin' ORDER BY id FOR UPDATE`
      );
      if (admins.rowCount <= 1) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: { code: "LAST_ADMIN", message: "Role admin terakhir tidak dapat dihapus." },
        });
      }
    }

    const updated = await client.query(
      `UPDATE "daftar_akun" SET role = $2, updated_at = now()
        WHERE id = $1 RETURNING id, nama, email, role, phone, created_at`,
      [id, role]
    );
    await client.query("COMMIT");
    return res.json({ data: updated.rows[0] });
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
});

// GET /api/admin/bookings?page=1&limit=20
router.get("/bookings", async (req, res) => {
  const page = toInt(req.query.page, 1, 1_000_000);
  const limit = toInt(req.query.limit, 20, 100);
  const offset = (page - 1) * limit;
  const [count, list] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS total FROM bookings"),
    pool.query(`
      SELECT b.id, b.status, b.customer_name, b.customer_phone,
             b.rental_type, b.pickup_at, b.return_at, b.duration_days,
             b.total, b.currency, b.created_at, b.account_id,
             v.slug AS vehicle_id, v.name AS vehicle_name,
             l.id AS location_id, l.city AS location_city
        FROM bookings b
        JOIN vehicles v ON v.id = b.vehicle_id
        JOIN locations l ON l.id = b.location_id
       ORDER BY b.created_at DESC
       LIMIT $1 OFFSET $2`,
    [limit, offset]),
  ]);
  return res.json({
    data: list.rows,
    meta: { page, limit, total: count.rows[0].total, totalPages: Math.ceil(count.rows[0].total / limit) },
  });
});

export default router;
