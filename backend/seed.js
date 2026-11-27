// Mengisi data awal: hub, kendaraan, dan stok kendaraan per hub.
// Aman dijalankan berulang (upsert). Jalankan: npm run seed
import { readFileSync } from "node:fs";
import pool from "./db.js";

const load = (name) =>
  JSON.parse(readFileSync(new URL(`./seed/${name}`, import.meta.url), "utf8"));

const locations = load("locations.json");
const vehicles = load("vehicles.json");

// Stok awal per hub (data contoh; ubah sesuai armada sebenarnya)
const STOCK = { car: 2, luxury: 1, motor: 4 };

const client = await pool.connect();
try {
  await client.query("BEGIN");

  // [TAMBAHAN BELAJAR] Seed mengisi koordinat latitude/longitude dari seed/locations.json.
  // Data ini dipakai endpoint peta untuk memusatkan Leaflet pada kota yang dipilih.
  for (const l of locations) {
    await client.query(
      `INSERT INTO locations (id, code, name, status, city, icon, color, sort_order, latitude, longitude)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET
         code = EXCLUDED.code, name = EXCLUDED.name, status = EXCLUDED.status,
         city = EXCLUDED.city, icon = EXCLUDED.icon, color = EXCLUDED.color,
         sort_order = EXCLUDED.sort_order, latitude = EXCLUDED.latitude,
         longitude = EXCLUDED.longitude`,
      [l.id, l.code, l.name, l.status, l.city, l.icon, l.color, l.sort_order, l.latitude, l.longitude]
    );
  }

  for (const v of vehicles) {
    const { rows } = await client.query(
      `INSERT INTO vehicles
         (slug, name, category, type, year, badge, badge_color, description, image,
          fallback_image, seats, transmission, fuel, price, price_unit, rating, trips,
          supports_self, supports_driver)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT (slug) DO UPDATE SET
         name = EXCLUDED.name, category = EXCLUDED.category, type = EXCLUDED.type,
         year = EXCLUDED.year, badge = EXCLUDED.badge, badge_color = EXCLUDED.badge_color,
         description = EXCLUDED.description, image = EXCLUDED.image,
         fallback_image = EXCLUDED.fallback_image, seats = EXCLUDED.seats,
         transmission = EXCLUDED.transmission, fuel = EXCLUDED.fuel, price = EXCLUDED.price,
         price_unit = EXCLUDED.price_unit, rating = EXCLUDED.rating, trips = EXCLUDED.trips,
         supports_self = EXCLUDED.supports_self, supports_driver = EXCLUDED.supports_driver,
         updated_at = now()
       RETURNING id`,
      [
        v.slug, v.name, v.category, v.type, v.year, v.badge, v.badge_color,
        v.description, v.image, v.fallback_image, v.seats, v.transmission, v.fuel,
        v.price, v.price_unit, v.rating, v.trips, v.supports_self, v.supports_driver,
      ]
    );

    // Stok tidak ditimpa bila sudah ada (DO NOTHING)
    for (const l of locations) {
      await client.query(
        `INSERT INTO vehicle_locations (vehicle_id, location_id, stock)
         VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [rows[0].id, l.id, STOCK[v.type] ?? 1]
      );
    }
  }

  await client.query("COMMIT");
  console.log(`Seed selesai: ${locations.length} hub, ${vehicles.length} kendaraan.`);
} catch (error) {
  await client.query("ROLLBACK");
  console.error("Seed gagal:", error.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
