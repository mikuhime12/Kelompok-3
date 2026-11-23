import test from "node:test";
import assert from "node:assert/strict";
import {
  parseDateTime,
  normalizePhone,
  parseBookingCore,
} from "../lib/validation.js";
import { calculatePrice, durationDays } from "../lib/pricing.js";
import { toWib, vehicleToApi } from "../lib/mappers.js";

test("parseDateTime: offset, Z, tanpa offset (WIB), '+' terdecode jadi spasi", () => {
  const a = parseDateTime("2026-10-15T09:00:00+07:00");
  assert.equal(a.toISOString(), "2026-10-15T02:00:00.000Z");
  assert.equal(parseDateTime("2026-10-15T02:00:00Z").getTime(), a.getTime());
  assert.equal(parseDateTime("2026-10-15T09:00").getTime(), a.getTime());
  assert.equal(parseDateTime("2026-10-15T09:00:00 07:00").getTime(), a.getTime());
  assert.equal(parseDateTime("15/10/2026"), null);
  assert.equal(parseDateTime("2026-13-45T09:00"), null);
  assert.equal(parseDateTime(123), null);
});

test("normalizePhone ke E.164", () => {
  assert.equal(normalizePhone("081234567890"), "+6281234567890");
  assert.equal(normalizePhone("+62 812-3456-7890"), "+6281234567890");
  assert.equal(normalizePhone("6281234567890"), "+6281234567890");
  assert.equal(normalizePhone("abc"), null);
  assert.equal(normalizePhone("123"), null);
});

test("durationDays dibulatkan ke atas, minimal 1", () => {
  const t = (s) => new Date(s);
  assert.equal(durationDays(t("2026-10-15T09:00Z"), t("2026-10-17T09:00Z")), 2);
  assert.equal(durationDays(t("2026-10-15T09:00Z"), t("2026-10-17T10:00Z")), 3);
  assert.equal(durationDays(t("2026-10-15T09:00Z"), t("2026-10-15T12:00Z")), 1);
});

test("harga: contoh kontrak (650000 x 2 + supir 200000 x 2 = 1700000)", () => {
  const car = { type: "car", fuel: "Hybrid", price: 650000 };
  assert.deepEqual(calculatePrice(car, "driver", 2), {
    vehicleSubtotal: 1300000, driverSubtotal: 400000, discount: 0, total: 1700000, currency: "IDR",
  });
  assert.equal(calculatePrice(car, "self", 2).driverSubtotal, 0);
});

test("harga: tanpa biaya supir untuk motor dan 'Termasuk Supir'", () => {
  assert.equal(calculatePrice({ type: "motor", fuel: "Bensin", price: 80000 }, "driver", 3).driverSubtotal, 0);
  const alphard = { type: "luxury", fuel: "Termasuk Supir", price: 2500000 };
  assert.equal(calculatePrice(alphard, "driver", 1).total, 2500000);
});

test("toWib & vehicleToApi", () => {
  assert.equal(toWib(new Date("2026-10-15T02:00:00Z")), "2026-10-15T09:00:00+07:00");
  const v = vehicleToApi({
    slug: "x", name: "N", category: "Mobil", type: "car", year: "2024", badge: "B",
    badge_color: "blue", description: "d", image: "i", fallback_image: null, seats: "5 Kursi",
    transmission: "Matic", fuel: "Bensin", price: 1, price_unit: "/ hari", rating: "4.9", trips: 3,
  });
  assert.equal(v.id, "x");
  assert.equal(v.rating, 4.9);
  assert.equal(v.badgeColor, "blue");
  assert.equal(v.fallbackImage, null);
});

test("parseBookingCore: lengkap valid", () => {
  const now = new Date("2026-10-12T00:00:00Z");
  const r = parseBookingCore(
    { vehicleId: "zenix-hybrid", cityId: "jakarta", rentalType: "driver",
      pickupAt: "2026-10-15T09:00:00+07:00", returnAt: "2026-10-17T09:00:00+07:00" },
    { now }
  );
  assert.deepEqual(r.details, []);
});

test("parseBookingCore: kumpulkan semua error", () => {
  const r = parseBookingCore({ rentalType: "x", pickupAt: "bukan-tanggal" });
  const fields = r.details.map((d) => d.field).sort();
  assert.deepEqual(fields, ["cityId", "pickupAt", "rentalType", "returnAt", "vehicleId"]);
});

test("parseBookingCore: return sebelum pickup, masa lalu, durasi terlalu panjang", () => {
  const now = new Date("2026-10-12T00:00:00Z");
  const base = { vehicleId: "a", cityId: "b", rentalType: "self" };
  assert.ok(parseBookingCore({ ...base, pickupAt: "2026-10-17T09:00+07:00", returnAt: "2026-10-15T09:00+07:00" }, { now })
    .details.some((d) => d.field === "returnAt"));
  assert.ok(parseBookingCore({ ...base, pickupAt: "2026-10-01T09:00+07:00", returnAt: "2026-10-03T09:00+07:00" }, { now })
    .details.some((d) => d.message.includes("masa lalu")));
  assert.ok(parseBookingCore({ ...base, pickupAt: "2026-10-15T09:00+07:00", returnAt: "2027-06-15T09:00+07:00" }, { now })
    .details.some((d) => d.message.includes("maksimal")));
});
