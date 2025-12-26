import { Request, Response } from "express";
import pool from "../db";

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ error: "Error retrieving orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM orders WHERE id=$1", [
      req.params.id,
    ]);

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Order not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("GET ORDER BY ID ERROR:", error);
    res.status(500).json({ error: "Error retrieving order" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const result = await pool.query(
      `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({ error: "Error updating status" });
  }
};
