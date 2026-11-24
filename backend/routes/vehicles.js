import { Router } from "express";
import pool from "../db.js";
import { notFound, sendData, sendList, validationError } from "../lib/http.js";
import { toWib, vehicleToApi } from "../lib/mappers.js";
import {
  RENTAL_TYPES,
  SLUG_RE,
  VEHICLE_TYPES,
  parseDateTime,
  parsePagination,
  str,
} from "../lib/validation.js";
import {
  checkAvailability,
  findActiveLocation,
  findActiveVehicle,
} from "../lib/availability.js";

const router = Router();

const escapeLike = (s) => s.replace(/[\\%_]/g, "\\$&");

/** Baca & validasi pickupAt/returnAt dari query. Keduanya wajib bersamaan. */
function readRange(query, { required }) {
  const details = [];
  const hasPickup = query.pickupAt !== undefined && query.pickupAt !== "";
  const hasReturn = query.returnAt !== undefined && query.returnAt !== "";
  if (!hasPickup && !hasReturn && !required) return { range: null, details };

  let pickupAt = null;
  let returnAt = null;
  if (!hasPickup) details.push({ field: "pickupAt", message: "pickupAt wajib diisi." });
  else if (!(pickupAt = parseDateTime(String(query.pickupAt))))
    details.push({ field: "pickupAt", message: "Format pickupAt harus ISO 8601." });

  if (!hasReturn) details.push({ field: "returnAt", message: "returnAt wajib diisi." });
  else if (!(returnAt = parseDateTime(String(query.returnAt))))
    details.push({ field: "returnAt", message: "Format returnAt harus ISO 8601." });

  if (pickupAt && returnAt && returnAt <= pickupAt)
    details.push({ field: "returnAt", message: "returnAt harus setelah pickupAt." });

  return { range: details.length ? null : { pickupAt, returnAt }, details };
}

// GET /api/vehicles
router.get("/", async (req, res) => {
  const q = req.query;
  const details = [];

  const { page, limit, details: pageDetails } = parsePagination(q);
  details.push(...pageDetails);

  const type = str(q.type);
  if (type && !VEHICLE_TYPES.includes(type))
    details.push({ field: "type", message: "type harus car, motor, atau luxury." });

  const rentalType = str(q.rentalType);
  if (rentalType && !RENTAL_TYPES.includes(rentalType))
    details.push({ field: "rentalType", message: "rentalType harus 'self' atau 'driver'." });

  const cityId = str(q.cityId);
  if (cityId && !SLUG_RE.test(cityId))
    details.push({ field: "cityId", message: "cityId tidak valid." });

  const category = str(q.category);
  if (category.length > 40)
    details.push({ field: "category", message: "category terlalu panjang." });

  const search = str(q.q);
  if (search.length > 100)
    details.push({ field: "q", message: "q maksimal 100 karakter." });

  const { range, details: rangeDetails } = readRange(q, { required: false });
  details.push(...rangeDetails);

  if (details.length) throw validationError(details);

  if (cityId) await findActiveLocation(pool, cityId); // 404 bila kota tidak ada

  const params = [];
  const add = (value) => {
    params.push(value);
    return `$${params.length}`;
  };
  const where = ["v.active = TRUE"];

  // Tab "Mobil" menampilkan car + luxury
  if (type === "car") where.push("v.type IN ('car', 'luxury')");
  else if (type) where.push(`v.type = ${add(type)}`);

  if (category && category !== "Semua") where.push(`v.category = ${add(category)}`);

  if (rentalType === "driver") where.push("v.supports_driver = TRUE");
  else if (rentalType === "self") where.push("v.supports_self = TRUE");

  if (search) {
    const p = add(`%${escapeLike(search)}%`);
    where.push(
      `(v.name ILIKE ${p} OR v.description ILIKE ${p} OR v.category ILIKE ${p} OR v.fuel ILIKE ${p})`
    );
  }

  if (cityId || range) {
    const sub = [
      "vl.vehicle_id = v.id",
      "lc.active = TRUE",
    ];
    if (cityId) sub.push(`vl.location_id = ${add(cityId)}`);
    if (range) {
      const pick = add(range.pickupAt.toISOString());
      const ret = add(range.returnAt.toISOString());
      sub.push(`vl.stock > (
        SELECT COUNT(*) FROM vehicle_availability_locks l
         WHERE l.vehicle_id = vl.vehicle_id
           AND l.location_id = vl.location_id
           AND l.status = 'active'
           AND l.pickup_at < ${ret}
           AND l.return_at > ${pick})`);
    }
    where.push(
      `EXISTS (SELECT 1 FROM vehicle_locations vl
                 JOIN locations lc ON lc.id = vl.location_id
                WHERE ${sub.join(" AND ")})`
    );
  }

  const whereSql = where.join(" AND ");

  const totalRes = await pool.query(
    `SELECT COUNT(*)::int AS total FROM vehicles v WHERE ${whereSql}`,
    params
  );
  const total = totalRes.rows[0].total;

  const limitP = add(limit);
  const offsetP = add((page - 1) * limit);
  const { rows } = await pool.query(
    `SELECT v.* FROM vehicles v
      WHERE ${whereSql}
      ORDER BY v.id
      LIMIT ${limitP} OFFSET ${offsetP}`,
    params
  );

  sendList(res, rows.map(vehicleToApi), {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
});

// GET /api/vehicles/:vehicleId
router.get("/:vehicleId", async (req, res) => {
  const { vehicleId } = req.params;
  if (!SLUG_RE.test(vehicleId))
    throw notFound("VEHICLE_NOT_FOUND", "Kendaraan tidak ditemukan.");
  const vehicle = await findActiveVehicle(pool, vehicleId);
  sendData(res, vehicleToApi(vehicle));
});

// GET /api/vehicles/:vehicleId/availability?cityId&pickupAt&returnAt[&rentalType]
router.get("/:vehicleId/availability", async (req, res) => {
  const { vehicleId } = req.params;
  const q = req.query;
  const details = [];

  if (!SLUG_RE.test(vehicleId))
    throw notFound("VEHICLE_NOT_FOUND", "Kendaraan tidak ditemukan.");

  const cityId = str(q.cityId);
  if (!cityId) details.push({ field: "cityId", message: "cityId wajib diisi." });
  else if (!SLUG_RE.test(cityId))
    details.push({ field: "cityId", message: "cityId tidak valid." });

  const rentalType = str(q.rentalType);
  if (rentalType && !RENTAL_TYPES.includes(rentalType))
    details.push({ field: "rentalType", message: "rentalType harus 'self' atau 'driver'." });

  const { range, details: rangeDetails } = readRange(q, { required: true });
  details.push(...rangeDetails);
  if (details.length) throw validationError(details);

  const vehicle = await findActiveVehicle(pool, vehicleId);
  await findActiveLocation(pool, cityId);

  let available = false;
  const rentalOk =
    !rentalType ||
    (rentalType === "driver" ? vehicle.supports_driver : vehicle.supports_self);
  if (rentalOk) {
    available = await checkAvailability(
      pool,
      vehicle.id,
      cityId,
      range.pickupAt,
      range.returnAt
    );
  }

  sendData(res, {
    available,
    vehicleId: vehicle.slug,
    cityId,
    pickupAt: toWib(range.pickupAt),
    returnAt: toWib(range.returnAt),
  });
});

export default router;
