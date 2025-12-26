import { Request, Response } from "express";
import pool from "../db";

export const getItemsByOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId;

    const result = await pool.query(
      `
      SELECT oi.*, 
             p.name AS product_name,
             pc.color_name,
             ps.size
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      LEFT JOIN product_colors pc ON pc.id = oi.color_id
      LEFT JOIN product_sizes ps ON ps.id = oi.size_id
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
    const { product_id, color_id, size_id, quantity, price } = req.body;

    const result = await pool.query(
      `
      INSERT INTO order_items (order_id, product_id, color_id, size_id, quantity, price)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [orderId, product_id, color_id, size_id, quantity, price]
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
    const { quantity, price, color_id, size_id } = req.body;

    const result = await pool.query(
      `
      UPDATE order_items
      SET quantity = $1,
          price = $2,
          color_id = $3,
          size_id = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
      `,
      [quantity, price, color_id, size_id, itemId]
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
