import { Router } from "express";
import pool from "../db";

const router = Router();

router.get("/autocomplete", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";

    if (!q.trim()) {
      return res.json({
        products: [],
        categories: [],
        suggestions: []
      });
    }

    const products = await pool.query(
      `
      SELECT p.id, p.name, p.price,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id LIMIT 1) AS image
      FROM products p
      WHERE p.name ILIKE $1
      ORDER BY p.name ASC
      LIMIT 5
      `,
      [`%${q}%`]
    );

    const categories = await pool.query(
      `
      SELECT id, name, slug
      FROM categories
      WHERE name ILIKE $1
      LIMIT 5
      `,
      [`%${q}%`]
    );

    const suggestions = await pool.query(
      `
      SELECT DISTINCT size AS value
      FROM product_variants
      WHERE size ILIKE $1
      LIMIT 5
      `,
      [`%${q}%`]
    );

    res.json({
      products: products.rows,
      categories: categories.rows,
      suggestions: suggestions.rows.map((s) => s.value)
    });
  } catch (err) {
    console.error("Autocomplete error:", err);
    res.status(500).json({ error: "Autocomplete error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";
    const size = (req.query.size as string) || null;
    const color = (req.query.color as string) || null;
    const minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
    const sort = (req.query.sort as string) || "relevance";

    let filters = [];
    let values: any[] = [`%${q}%`];
    let idx = 2;

    if (size) {
      filters.push(`v.size = $${idx}`);
      values.push(size);
      idx++;
    }

    if (color) {
      filters.push(`v.color_hex = $${idx}`);
      values.push(color);
      idx++;
    }

    if (minPrice !== null) {
      filters.push(`p.price >= $${idx}`);
      values.push(minPrice);
      idx++;
    }

    if (maxPrice !== null) {
      filters.push(`p.price <= $${idx}`);
      values.push(maxPrice);
      idx++;
    }

    const extraWhere = filters.length ? `AND ${filters.join(" AND ")}` : "";

    let orderBy = "p.id";
    if (sort === "price_asc") orderBy = "p.price ASC";
    if (sort === "price_desc") orderBy = "p.price DESC";

    const sql = `
      SELECT DISTINCT 
        p.id,
        p.name,
        p.price,
        (SELECT image_url FROM product_images WHERE product_id=p.id ORDER BY id LIMIT 1) AS image
      FROM products p
      LEFT JOIN product_variants v ON v.product_id = p.id
      WHERE p.name ILIKE $1
      ${extraWhere}
      ORDER BY ${orderBy}
    `;

    const result = await pool.query(sql, values);

    res.json({
      products: result.rows,
      total: result.rows.length
    });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ error: "Search error" });
  }
});

export default router;
