import { Request, Response } from "express";
import pool from "../db";
import { sendEmail, emailTemplates } from "../services/email.service";

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ error: "Error retrieving orders" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       WHERE o.id = $1`,
      [req.params.id]
    );

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
    const orderId = req.params.id;

    const result = await pool.query(
      `UPDATE orders SET status=$1, updated_at=NOW() WHERE id=$2 RETURNING *`,
      [status, orderId]
    );

    const order = result.rows[0];

    // Obtener información del usuario para enviar email
    if (order && order.user_id) {
      const userResult = await pool.query(
        "SELECT email, name FROM users WHERE id = $1",
        [order.user_id]
      );

      if (userResult.rows.length > 0) {
        const user = userResult.rows[0];
        
        // Enviar email de actualización de estatus
        sendEmail({
          to: user.email,
          subject: `Actualización de tu pedido #${orderId} - FYTTSA`,
          html: emailTemplates.orderStatusUpdate(
            parseInt(orderId),
            status,
            user.name
          ),
        }).catch(err => console.error("Error enviando email de estatus:", err));
      }
    }

    res.json(order);
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({ error: "Error updating status" });
  }
};
