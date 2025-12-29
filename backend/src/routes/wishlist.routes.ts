import { Router } from "express";
import pool from "../db";

const router = Router();

// Middleware para verificar token
const verifyToken = (req: any, res: any, next: any) => {
  const jwt = require("jsonwebtoken");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// GET - Obtener wishlist del usuario
router.get("/", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT w.id, w.product_id, w.created_at,
              p.name, p.price,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.id LIMIT 1) as image
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [userId]
    );

    const items = result.rows.map(row => ({
      id: row.id,
      product_id: row.product_id,
      created_at: row.created_at,
      product: {
        id: row.product_id,
        name: row.name,
        price: parseFloat(row.price),
        image: row.image
      }
    }));

    return res.json(items);
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    res.status(500).json({ error: "Error al obtener favoritos" });
  }
});

// POST - Agregar producto a wishlist
router.post("/", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "product_id es requerido" });
    }

    // Verificar si el producto existe
    const productCheck = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Verificar si ya está en wishlist
    const existing = await pool.query(
      "SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2",
      [userId, product_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "El producto ya está en favoritos" });
    }

    // Agregar a wishlist
    const result = await pool.query(
      `INSERT INTO wishlist (user_id, product_id, created_at) 
       VALUES ($1, $2, NOW()) 
       RETURNING id, product_id, created_at`,
      [userId, product_id]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);
    res.status(500).json({ error: "Error al agregar a favoritos" });
  }
});

// DELETE - Eliminar producto de wishlist
router.delete("/:productId", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await pool.query(
      "DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id",
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado en favoritos" });
    }

    return res.json({ message: "Eliminado de favoritos" });
  } catch (error) {
    console.error("DELETE FROM WISHLIST ERROR:", error);
    res.status(500).json({ error: "Error al eliminar de favoritos" });
  }
});

export default router;
