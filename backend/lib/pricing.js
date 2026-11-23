// Aturan harga. Harga final SELALU dihitung di server.

export const DRIVER_RATE_PER_DAY = 200_000;
export const CANCEL_FREE_HOURS = 24;
export const QUOTE_TTL_MINUTES = 10;
export const FUEL_DRIVER_INCLUDED = "Termasuk Supir";

/** Durasi dibulatkan ke atas per 24 jam, minimal 1 hari. */
export function durationDays(pickupAt, returnAt) {
  return Math.max(1, Math.ceil((returnAt - pickupAt) / 86_400_000));
}

/**
 * Tarif supir hanya berlaku bila kendaraan bukan motor, mode 'driver',
 * dan fuel bukan 'Termasuk Supir' (supir sudah termasuk tarif).
 */
export function driverRatePerDay(vehicle, rentalType) {
  if (vehicle.type === "motor") return 0;
  if (rentalType !== "driver") return 0;
  if (vehicle.fuel === FUEL_DRIVER_INCLUDED) return 0;
  return DRIVER_RATE_PER_DAY;
}

export function calculatePrice(vehicle, rentalType, days) {
  const vehicleSubtotal = vehicle.price * days;
  const driverSubtotal = driverRatePerDay(vehicle, rentalType) * days;
  const discount = 0;
  return {
    vehicleSubtotal,
    driverSubtotal,
    discount,
    total: vehicleSubtotal + driverSubtotal - discount,
    currency: "IDR",
  };
}
