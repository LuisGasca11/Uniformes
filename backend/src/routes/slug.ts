import { Router } from "express";
import pool from "../db";

const router = Router();

router.get("/slug/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE slug = $1",
      [req.params.slug]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Not found" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error /categories/slug:", err);
    res.status(500).json({ error: "Error fetching category" });
  }
});
