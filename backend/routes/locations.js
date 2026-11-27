import { Router } from "express";
import pool from "../db.js";
import { ApiError, notFound, sendData } from "../lib/http.js";
import { locationToApi } from "../lib/mappers.js";
import { SLUG_RE } from "../lib/validation.js";
import { findActiveLocation } from "../lib/availability.js";

const router = Router();

// GET /api/locations
router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM locations WHERE active = TRUE ORDER BY sort_order, id"
  );
  sendData(res, rows.map(locationToApi));
});

// GET /api/locations/:locationId/map
// Backend menyediakan koordinat hub; Leaflet di frontend menampilkan tile OpenStreetMap.
router.get("/:locationId/map", async (req, res) => {
  const { locationId } = req.params;
  if (!SLUG_RE.test(locationId)) {
    throw notFound("LOCATION_NOT_FOUND", "Kota tidak ditemukan.");
  }

  const location = await findActiveLocation(pool, locationId);
  // [TAMBAHAN BELAJAR] Ambil koordinat tersimpan; jangan panggil layanan geocoding eksternal.
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError(
      503,
      "MAP_COORDINATES_MISSING",
      "Koordinat lokasi belum dikonfigurasi. Jalankan migrasi dan seed lokasi."
    );
  }

  sendData(res, {
    location: locationToApi(location),
    map: {
      latitude,
      longitude,
      // [TAMBAHAN BELAJAR] URL tile dipakai Leaflet untuk menggambar peta dasar OSM.
      tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      openStreetMapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=13/${latitude}/${longitude}`,
      approximate: true,
    },
  });
});

export default router;
