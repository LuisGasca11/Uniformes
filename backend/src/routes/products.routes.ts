import { Router, Request, Response } from "express";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/products.controller";
import { upload } from "../middleware/upload";
import pool from "../db";
import fs from "fs";

const router = Router();

router.get("/", getAllProducts);
router.put("/:id", updateProduct);
router.post("/", createProduct); 
router.get("/:id", getProductById);
router.delete("/:id", deleteProduct);

router.get("/search", async (req: Request, res: Response) => {
  try {
    const q = `%${req.query.q ?? ""}%`;

    const products = await pool.query(`
      SELECT *
      FROM products
      WHERE LOWER(name) LIKE LOWER($1)
         OR LOWER(description) LIKE LOWER($1)
      ORDER BY id
    `, [q]);

    res.json(products.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error searching" });
  }
});

router.get("/autocomplete", async (req, res) => {
  try {
    const q = (req.query.q as string) || "";

    if (!q.trim()) return res.json([]);

    const sql = `
      SELECT p.id, p.name, p.price,
        (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id LIMIT 1) AS image
      FROM products p
      WHERE p.name ILIKE $1
      ORDER BY p.name ASC
      LIMIT 8
    `;

    const result = await pool.query(sql, [`%${q}%`]);

    res.json(result.rows);
  } catch (err) {
    console.error("Autocomplete error:", err);
    res.status(500).json({ error: "Autocomplete error" });
  }
});


router.post("/:id/images", upload.single("image"), async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    const filename = (req as any).file?.filename;

    const result = await pool.query(
      "INSERT INTO product_images (product_id, image_url) VALUES ($1, $2) RETURNING id",
      [productId, filename]
    );

    return res.json({
      success: true,
      id: result.rows[0].id,
      image_url: filename,
    });

  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.status(500).json({ error: "Error uploading image" });
  }
});


router.delete("/:id/images/:imageId", async (req: Request, res: Response) => {
  try {
    const { id, imageId } = req.params;

    const image = await pool.query(
      "SELECT image_url FROM product_images WHERE id = $1 AND product_id = $2",
      [imageId, id]
    );

    if (image.rowCount === 0)
      return res.status(404).json({ error: "Image not found" });

    const filename = image.rows[0].image_url;

    fs.unlinkSync(`./public/uploads/${filename}`);

    await pool.query(
      "DELETE FROM product_images WHERE id = $1 AND product_id = $2",
      [imageId, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE IMAGE ERROR:", err);
    res.status(500).json({ error: "Error deleting image" });
  }
});

export default router;
