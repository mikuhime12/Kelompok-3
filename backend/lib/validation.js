// Validasi & normalisasi input. Tidak menyentuh database.

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,59}$/;
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const RENTAL_TYPES = ["self", "driver"];
export const VEHICLE_TYPES = ["car", "motor", "luxury"];

// Zona waktu bawaan bila klien mengirim tanggal tanpa offset
// (mis. nilai <input type="datetime-local">): WIB.
export const DEFAULT_OFFSET = "+07:00";

const DATETIME_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(Z|[+-]\d{2}:\d{2})?$/;

/**
 * Parse ISO 8601 -> Date. Mengembalikan null bila tidak valid.
 * Tanda "+" pada offset yang terdecode jadi spasi di query string dipulihkan.
 */
export function parseDateTime(value) {
  if (typeof value !== "string") return null;
  const raw = value.replace(/ (\d{2}:\d{2})$/, "+$1").trim();
  const m = DATETIME_RE.exec(raw);
  if (!m) return null;
  const withZone = m[1] ? raw : raw + DEFAULT_OFFSET;
  const date = new Date(withZone);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Normalisasi nomor telepon ke E.164. Menerima "08123...", "628123...",
 * "+62 812-3456-7890". Mengembalikan null bila bukan nomor yang valid.
 */
export function normalizePhone(value) {
  if (typeof value !== "string") return null;
  let p = value.replace(/[\s().-]/g, "");
  if (p.startsWith("00")) p = "+" + p.slice(2);
  else if (p.startsWith("0")) p = "+62" + p.slice(1);
  else if (/^62\d/.test(p)) p = "+" + p;
  return /^\+[1-9]\d{7,14}$/.test(p) ? p : null;
}

export function parsePagination(query) {
  const details = [];
  let page = 1;
  let limit = 20;

  if (query.page !== undefined) {
    page = Number(query.page);
    if (!Number.isInteger(page) || page < 1) {
      details.push({ field: "page", message: "page harus bilangan bulat >= 1." });
    }
  }
  if (query.limit !== undefined) {
    limit = Number(query.limit);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      details.push({ field: "limit", message: "limit harus bilangan bulat 1-100." });
    }
  }
  return { page, limit, details };
}

export const str = (v) => (typeof v === "string" ? v.trim() : "");

/**
 * Validasi bagian bersama (vehicleId, cityId, rentalType, pickupAt, returnAt)
 * untuk quote dan pembuatan booking. `body` boleh berisi apa saja.
 */
export function parseBookingCore(body, { now = new Date() } = {}) {
  const details = [];
  const b = body && typeof body === "object" ? body : {};

  const vehicleId = str(b.vehicleId);
  if (!vehicleId) details.push({ field: "vehicleId", message: "vehicleId wajib diisi." });
  else if (!SLUG_RE.test(vehicleId))
    details.push({ field: "vehicleId", message: "vehicleId tidak valid." });

  const cityId = str(b.cityId);
  if (!cityId) details.push({ field: "cityId", message: "cityId wajib diisi." });
  else if (!SLUG_RE.test(cityId))
    details.push({ field: "cityId", message: "cityId tidak valid." });

  const rentalType = str(b.rentalType);
  if (!rentalType) details.push({ field: "rentalType", message: "rentalType wajib diisi." });
  else if (!RENTAL_TYPES.includes(rentalType))
    details.push({ field: "rentalType", message: "rentalType harus 'self' atau 'driver'." });

  let pickupAt = null;
  let returnAt = null;

  if (b.pickupAt === undefined || b.pickupAt === "" || b.pickupAt === null) {
    details.push({ field: "pickupAt", message: "Waktu penjemputan wajib diisi." });
  } else {
    pickupAt = parseDateTime(b.pickupAt);
    if (!pickupAt)
      details.push({ field: "pickupAt", message: "Format pickupAt harus ISO 8601." });
  }

  if (b.returnAt === undefined || b.returnAt === "" || b.returnAt === null) {
    details.push({ field: "returnAt", message: "Waktu pengembalian wajib diisi." });
  } else {
    returnAt = parseDateTime(b.returnAt);
    if (!returnAt)
      details.push({ field: "returnAt", message: "Format returnAt harus ISO 8601." });
  }

  if (pickupAt && returnAt) {
    if (returnAt <= pickupAt) {
      details.push({
        field: "returnAt",
        message: "Waktu pengembalian harus setelah waktu penjemputan.",
      });
    } else {
      const days = Math.ceil((returnAt - pickupAt) / 86_400_000);
      if (days > MAX_RENTAL_DAYS) {
        details.push({
          field: "returnAt",
          message: `Durasi sewa maksimal ${MAX_RENTAL_DAYS} hari.`,
        });
      }
    }
    // toleransi 5 menit agar form yang baru diisi tidak langsung ditolak
    if (pickupAt.getTime() < now.getTime() - 5 * 60_000) {
      details.push({
        field: "pickupAt",
        message: "Waktu penjemputan tidak boleh di masa lalu.",
      });
    }
  }

  return {
    details,
    value: { vehicleId, cityId, rentalType, pickupAt, returnAt },
  };
}

export const MAX_RENTAL_DAYS = 90;
