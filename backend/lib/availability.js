import { ApiError, notFound, validationError } from "./http.js";

/**
 * Cek ketersediaan satu kendaraan di satu hub pada rentang waktu.
 * Tersedia bila jumlah lock aktif yang tumpang tindih < stock hub tersebut.
 * Dengan { lock: true } baris vehicle_locations di-lock (FOR UPDATE) sehingga
 * dua transaksi yang memesan unit sama diserialkan -> tidak ada double booking.
 * `db` boleh pool atau client transaksi.
 */
export async function checkAvailability(
  db,
  vehicleDbId,
  locationId,
  pickupAt,
  returnAt,
  { lock = false } = {}
) {
  const { rows } = await db.query(
    `SELECT vl.stock,
            (SELECT COUNT(*)::int
               FROM vehicle_availability_locks l
              WHERE l.vehicle_id = vl.vehicle_id
                AND l.location_id = vl.location_id
                AND l.status = 'active'
                AND l.pickup_at < $4
                AND l.return_at > $3) AS booked
       FROM vehicle_locations vl
      WHERE vl.vehicle_id = $1 AND vl.location_id = $2
      ${lock ? "FOR UPDATE OF vl" : ""}`,
    [vehicleDbId, locationId, pickupAt.toISOString(), returnAt.toISOString()]
  );
  if (rows.length === 0) return false; // kendaraan tidak ada di hub ini
  return rows[0].stock > rows[0].booked;
}

export async function findActiveVehicle(db, slug) {
  const { rows } = await db.query(
    "SELECT * FROM vehicles WHERE slug = $1 AND active = TRUE",
    [slug]
  );
  if (rows.length === 0) throw notFound("VEHICLE_NOT_FOUND", "Kendaraan tidak ditemukan.");
  return rows[0];
}

export async function findActiveLocation(db, id) {
  const { rows } = await db.query(
    "SELECT * FROM locations WHERE id = $1 AND active = TRUE",
    [id]
  );
  if (rows.length === 0) throw notFound("LOCATION_NOT_FOUND", "Kota tidak ditemukan.");
  return rows[0];
}

export function assertRentalSupported(vehicle, rentalType) {
  const ok = rentalType === "driver" ? vehicle.supports_driver : vehicle.supports_self;
  if (!ok) {
    throw validationError([
      {
        field: "rentalType",
        message:
          rentalType === "driver"
            ? "Kendaraan ini tidak tersedia dengan supir."
            : "Kendaraan ini tidak tersedia tanpa supir.",
      },
    ]);
  }
}

export const unavailable = () =>
  new ApiError(
    409,
    "VEHICLE_UNAVAILABLE",
    "Kendaraan tidak tersedia pada rentang waktu yang dipilih."
  );
