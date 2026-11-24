import { Router } from "express";
import crypto from "node:crypto";
import pool from "../db.js";
import { ApiError, notFound, sendData, validationError } from "../lib/http.js";
import { bookingToApi, toWib } from "../lib/mappers.js";
import {
  CANCEL_FREE_HOURS,
  QUOTE_TTL_MINUTES,
  calculatePrice,
  durationDays,
} from "../lib/pricing.js";
import {
  UUID_RE,
  normalizePhone,
  parseBookingCore,
  str,
} from "../lib/validation.js";
import {
  assertRentalSupported,
  checkAvailability,
  findActiveLocation,
  findActiveVehicle,
  unavailable,
} from "../lib/availability.js";

const router = Router();

const BOOKING_SELECT = `
  SELECT b.*, v.slug AS vehicle_slug, v.name AS vehicle_name
    FROM bookings b
    JOIN vehicles v ON v.id = b.vehicle_id`;

const CANCELLABLE = ["pending_confirmation", "confirmed"];

// ---------- helper ----------

function readToken(req) {
  const header = req.get("x-booking-token");
  if (typeof header === "string" && header) return header;
  return typeof req.query.token === "string" ? req.query.token : "";
}

function tokenMatches(expected, given) {
  const a = Buffer.from(String(expected));
  const b = Buffer.from(String(given));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const bookingNotFound = () => notFound("BOOKING_NOT_FOUND", "Pemesanan tidak ditemukan.");

/** Validasi + hitung harga. `db` = pool atau client transaksi. */
async function prepareBooking(db, input, { lock }) {
  const vehicle = await findActiveVehicle(db, input.vehicleId);
  const location = await findActiveLocation(db, input.cityId);
  assertRentalSupported(vehicle, input.rentalType);

  const available = await checkAvailability(
    db,
    vehicle.id,
    location.id,
    input.pickupAt,
    input.returnAt,
    { lock }
  );
  if (!available) throw unavailable();

  const days = durationDays(input.pickupAt, input.returnAt);
  const priceBreakdown = calculatePrice(vehicle, input.rentalType, days);
  return { vehicle, location, days, priceBreakdown };
}

function parseCustomer(body) {
  const details = [];
  const c = body?.customer && typeof body.customer === "object" ? body.customer : null;
  if (!c) {
    details.push({ field: "customer", message: "Data pelanggan wajib diisi." });
    return { details, value: null };
  }

  const name = str(c.name);
  if (!name) details.push({ field: "customer.name", message: "Nama wajib diisi." });
  else if (name.length > 100)
    details.push({ field: "customer.name", message: "Nama maksimal 100 karakter." });

  let phone = null;
  if (!str(c.phone)) {
    details.push({ field: "customer.phone", message: "Nomor telepon wajib diisi." });
  } else {
    phone = normalizePhone(c.phone);
    if (!phone)
      details.push({
        field: "customer.phone",
        message: "Nomor telepon tidak valid (contoh: +6281234567890).",
      });
  }
  return { details, value: { name, phone } };
}

// ---------- POST /api/bookings/quote ----------

router.post("/quote", async (req, res) => {
  const { details, value } = parseBookingCore(req.body);
  if (details.length) throw validationError(details);

  const { days, priceBreakdown } = await prepareBooking(pool, value, { lock: false });

  sendData(res, {
    available: true,
    durationDays: days,
    priceBreakdown,
    expiresAt: toWib(new Date(Date.now() + QUOTE_TTL_MINUTES * 60_000)),
  });
});

// ---------- POST /api/bookings ----------

async function findByIdempotencyKey(key) {
  const { rows } = await pool.query(
    `${BOOKING_SELECT} WHERE b.idempotency_key = $1`,
    [key]
  );
  return rows[0] ?? null;
}

// Request yang sama dengan Idempotency-Key yang sama -> kembalikan booking awal.
// Payload berbeda dengan key yang sama -> 409.
function replayOrConflict(existing, input, customer) {
  const same =
    existing.vehicle_slug === input.vehicleId &&
    existing.location_id === input.cityId &&
    existing.rental_type === input.rentalType &&
    existing.pickup_at.getTime() === input.pickupAt.getTime() &&
    existing.return_at.getTime() === input.returnAt.getTime() &&
    existing.customer_name === customer.name &&
    existing.customer_phone === customer.phone;
  if (!same) {
    throw new ApiError(
      409,
      "IDEMPOTENCY_KEY_REUSED",
      "Idempotency-Key sudah dipakai untuk permintaan yang berbeda."
    );
  }
  return bookingToApi(existing, { includeToken: true });
}

router.post("/", async (req, res) => {
  const core = parseBookingCore(req.body);
  const cust = parseCustomer(req.body);
  const details = [...core.details, ...cust.details];

  const keyHeader = req.get("idempotency-key");
  const idempotencyKey = keyHeader ? keyHeader.trim() : null;
  if (idempotencyKey !== null && (!idempotencyKey || idempotencyKey.length > 100)) {
    details.push({
      field: "Idempotency-Key",
      message: "Idempotency-Key harus 1-100 karakter.",
    });
  }
  if (details.length) throw validationError(details);

  const input = core.value;
  const customer = cust.value;

  if (idempotencyKey) {
    const existing = await findByIdempotencyKey(idempotencyKey);
    if (existing) return sendData(res, replayOrConflict(existing, input, customer), 201);
  }

  const client = await pool.connect();
  let bookingId;
  try {
    await client.query("BEGIN");

    const { vehicle, location, days, priceBreakdown } = await prepareBooking(
      client,
      input,
      { lock: true }
    );

    const accessToken = crypto.randomBytes(32).toString("hex"); // 64 karakter

    const inserted = await client.query(
      `INSERT INTO bookings
         (vehicle_id, location_id, rental_type, pickup_at, return_at, duration_days,
          customer_name, customer_phone,
          vehicle_subtotal, driver_subtotal, discount, total, currency,
          access_token, idempotency_key)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       RETURNING id`,
      [
        vehicle.id,
        location.id,
        input.rentalType,
        input.pickupAt.toISOString(),
        input.returnAt.toISOString(),
        days,
        customer.name,
        customer.phone,
        priceBreakdown.vehicleSubtotal,
        priceBreakdown.driverSubtotal,
        priceBreakdown.discount,
        priceBreakdown.total,
        priceBreakdown.currency,
        accessToken,
        idempotencyKey,
      ]
    );
    bookingId = inserted.rows[0].id;

    await client.query(
      `INSERT INTO vehicle_availability_locks
         (vehicle_id, location_id, booking_id, pickup_at, return_at)
       VALUES ($1,$2,$3,$4,$5)`,
      [
        vehicle.id,
        location.id,
        bookingId,
        input.pickupAt.toISOString(),
        input.returnAt.toISOString(),
      ]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});

    // Dua request dengan Idempotency-Key sama berpacu: pemenang sudah commit.
    if (err.code === "23505" && idempotencyKey) {
      const existing = await findByIdempotencyKey(idempotencyKey);
      if (existing) return sendData(res, replayOrConflict(existing, input, customer), 201);
    }
    throw err;
  } finally {
    client.release();
  }

  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [bookingId]);
  sendData(res, bookingToApi(rows[0], { includeToken: true }), 201);
});

// ---------- GET /api/bookings/:bookingId ----------

router.get("/:bookingId", async (req, res) => {
  const { bookingId } = req.params;
  if (!UUID_RE.test(bookingId)) throw bookingNotFound();

  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [bookingId]);
  // 404 yang sama untuk "tidak ada" dan "token salah" agar ID tidak bisa ditebak
  if (rows.length === 0 || !tokenMatches(rows[0].access_token, readToken(req)))
    throw bookingNotFound();

  sendData(res, bookingToApi(rows[0]));
});

// ---------- POST /api/bookings/:bookingId/cancel ----------

router.post("/:bookingId/cancel", async (req, res) => {
  const { bookingId } = req.params;
  if (!UUID_RE.test(bookingId)) throw bookingNotFound();

  let reason = null;
  const rawReason = req.body?.reason;
  if (rawReason !== undefined && rawReason !== null) {
    if (typeof rawReason !== "string" || rawReason.trim().length > 500) {
      throw validationError([
        { field: "reason", message: "reason harus teks maksimal 500 karakter." },
      ]);
    }
    reason = rawReason.trim() || null;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `${BOOKING_SELECT} WHERE b.id = $1 FOR UPDATE OF b`,
      [bookingId]
    );
    if (rows.length === 0 || !tokenMatches(rows[0].access_token, readToken(req)))
      throw bookingNotFound();

    const booking = rows[0];

    if (!CANCELLABLE.includes(booking.status)) {
      throw new ApiError(
        409,
        "BOOKING_NOT_CANCELLABLE",
        "Pemesanan dengan status ini tidak dapat dibatalkan."
      );
    }

    const hoursLeft = (booking.pickup_at.getTime() - Date.now()) / 3_600_000;
    if (hoursLeft < CANCEL_FREE_HOURS) {
      throw new ApiError(
        409,
        "CANCELLATION_WINDOW_PASSED",
        `Pembatalan hanya dapat dilakukan paling lambat ${CANCEL_FREE_HOURS} jam sebelum penjemputan.`
      );
    }

    await client.query(
      `UPDATE bookings
          SET status = 'cancelled', cancel_reason = $2, updated_at = now()
        WHERE id = $1`,
      [bookingId, reason]
    );
    await client.query(
      `UPDATE vehicle_availability_locks SET status = 'released'
        WHERE booking_id = $1 AND status = 'active'`,
      [bookingId]
    );

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  const { rows } = await pool.query(`${BOOKING_SELECT} WHERE b.id = $1`, [bookingId]);
  sendData(res, bookingToApi(rows[0]));
});

export default router;
