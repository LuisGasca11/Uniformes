import { Request, Response } from "express";
import pool from "../db";

export const getItemsByOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;

    const result = await pool.query(
      `
      SELECT oi.id,
             oi.order_id,
             oi.quantity,
             oi.price,
             COALESCE(oi.product_id, pv.product_id) AS product_id,
             oi.variant_id,
             p.name AS product_name,
             pv.color_name,
             pv.color_hex,
             pv.size,
             (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id LIMIT 1) AS image
      FROM order_items oi
      LEFT JOIN product_variants pv ON pv.id = oi.variant_id
      LEFT JOIN products p ON p.id = COALESCE(oi.product_id, pv.product_id)
      WHERE oi.order_id = $1
      ORDER BY oi.id
      `,
      [orderId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("ERROR getItemsByOrder:", err);
    res.status(500).json({ error: "Error fetching order items" });
  }
};

export const addItemToOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;
    const { product_id, variant_id, quantity, price } = req.body;

    const result = await pool.query(
      `
      INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [orderId, product_id, variant_id, quantity, price]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR addItemToOrder:", err);
    res.status(500).json({ error: "Error adding item" });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const itemId = req.params.itemId;
    const { quantity, price, variant_id } = req.body;

    const result = await pool.query(
      `
      UPDATE order_items
      SET quantity = $1,
          price = $2,
          variant_id = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [quantity, price, variant_id, itemId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR updateItem:", err);
    res.status(500).json({ error: "Error updating item" });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM order_items WHERE id = $1", [
      req.params.itemId,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("ERROR deleteItem:", err);
    res.status(500).json({ error: "Error deleting item" });
  }
};
