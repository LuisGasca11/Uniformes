import { Router, Request, Response } from "express";
import pool from "../db";
import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orders.controller";

const router = Router();

router.get("/", getAllOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrderStatus);

router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await pool.query(
      `
      SELECT o.id, o.total, o.status, o.created_at
      FROM orders o
      WHERE o.user_id = $1
      ORDER BY o.created_at DESC
      `,
      [userId]
    );

    const orderList = [];

    for (const order of orders.rows) {
      const items = await pool.query(
        `
        SELECT 
          oi.id,
          oi.product_id,
          oi.quantity,
          oi.price,
          pv.size,
          pv.color_name,
          pv.color_hex,
          p.name,
          (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY id LIMIT 1) AS image
        FROM order_items oi
        JOIN product_variants pv ON pv.id = oi.variant_id
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
        `,
        [order.id]
      );

      orderList.push({
        ...order,
        items: items.rows
      });
    }

    res.json(orderList);
  } catch (error) {
    console.error("ORDER FETCH ERROR:", error);
    res.status(500).json({ error: "Error al obtener pedidos" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  try {
    const orders = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );

    res.json(orders.rows);
  } catch (err) {
    console.error("ERROR GET /orders:", err);
    res.status(500).json({ error: "Error fetching orders" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;

    const order = await pool.query(
      "SELECT * FROM orders WHERE id = $1",
      [id]
    );

    if (order.rowCount === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(order.rows[0]);
  } catch (err) {
    console.error("ERROR GET /orders/:id:", err);
    res.status(500).json({ error: "Error fetching order" });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const { user_id, total, status } = req.body;

    const result = await pool.query(
      `
      INSERT INTO orders (user_id, total, status)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [user_id, total, status ?? "pending"]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR POST /orders:", err);
    res.status(500).json({ error: "Error creating order" });
  }
});

router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { total, status } = req.body;

    const result = await pool.query(
      `
      UPDATE orders
      SET total = $1,
          status = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
      `,
      [total, status, id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Order not found" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR PUT /orders:", err);
    res.status(500).json({ error: "Error updating order" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM orders WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("ERROR DELETE /orders:", err);
    res.status(500).json({ error: "Error deleting order" });
  }
});

export default router;
