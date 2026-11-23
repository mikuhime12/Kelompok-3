import { Router } from "express";
import pool from "../db.js";
import { sendData } from "../lib/http.js";
import { locationToApi } from "../lib/mappers.js";

const router = Router();

// GET /api/locations
router.get("/", async (req, res) => {
  const { rows } = await pool.query(
    "SELECT * FROM locations WHERE active = TRUE ORDER BY sort_order, id"
  );
  sendData(res, rows.map(locationToApi));
});

export default router;
