// Mengubah baris database (snake_case) ke bentuk API (camelCase, sama dengan data statis frontend).

const WIB_MS = 7 * 3600 * 1000;

/** Date -> ISO 8601 dengan offset +07:00 (mis. 2026-10-15T09:00:00+07:00). */
export function toWib(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  return new Date(d.getTime() + WIB_MS).toISOString().slice(0, 19) + "+07:00";
}

export function vehicleToApi(row) {
  return {
    id: row.slug,
    name: row.name,
    category: row.category,
    type: row.type,
    year: row.year,
    badge: row.badge,
    badgeColor: row.badge_color,
    description: row.description,
    image: row.image,
    fallbackImage: row.fallback_image,
    seats: row.seats,
    transmission: row.transmission,
    fuel: row.fuel,
    price: row.price,
    priceUnit: row.price_unit,
    // kolom numeric dikembalikan pg sebagai string
    rating: row.rating === null ? null : Number(row.rating),
    trips: row.trips,
  };
}

export function locationToApi(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status,
    city: row.city,
    icon: row.icon,
    color: row.color,
  };
}

/**
 * Baris booking yang sudah di-join dengan vehicles (vehicle_slug, vehicle_name).
 * accessToken hanya disertakan saat booking dibuat.
 */
export function bookingToApi(row, { includeToken = false } = {}) {
  const booking = {
    id: row.id,
    status: row.status,
    vehicle: { id: row.vehicle_slug, name: row.vehicle_name },
    customer: { name: row.customer_name, phone: row.customer_phone },
    cityId: row.location_id,
    rentalType: row.rental_type,
    pickupAt: toWib(row.pickup_at),
    returnAt: toWib(row.return_at),
    durationDays: row.duration_days,
    priceBreakdown: {
      vehicleSubtotal: row.vehicle_subtotal,
      driverSubtotal: row.driver_subtotal,
      discount: row.discount,
      total: row.total,
      currency: row.currency,
    },
    createdAt: toWib(row.created_at),
  };
  if (row.cancel_reason) booking.cancelReason = row.cancel_reason;
  if (includeToken) booking.accessToken = row.access_token;
  return booking;
}
