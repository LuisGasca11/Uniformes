  import { Router } from "express";
import pool from "../db";
import jwt from "jsonwebtoken";

const router = Router();

// Middleware para verificar token de admin
const verifyAdmin = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Token no proporcionado" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    if (decoded.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Token inválido" });
  }
};

// GET todos los usuarios (solo admin)
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.role, 
        u.created_at,
        u.last_login,
        COUNT(DISTINCT o.id) as total_orders,
        COALESCE(SUM(o.total), 0) as total_spent
      FROM users u
      LEFT JOIN orders o ON u.id = o.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// GET usuario por ID con sus pedidos
router.get("/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener usuario
    const userResult = await pool.query(
      "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
      [id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Obtener pedidos del usuario
    const ordersResult = await pool.query(`
      SELECT id, total, status, payment_method, created_at
      FROM orders 
      WHERE user_id = $1 
      ORDER BY created_at DESC
    `, [id]);

    // Obtener direcciones del usuario
    const addressesResult = await pool.query(`
      SELECT id, label, street, city, state, zip, is_default
      FROM addresses 
      WHERE user_id = $1
    `, [id]);

    res.json({
      ...userResult.rows[0],
      orders: ordersResult.rows,
      addresses: addressesResult.rows
    });
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

// GET estadísticas para dashboard
router.get("/stats/dashboard", verifyAdmin, async (req, res) => {
  try {
    // Total usuarios
    const usersResult = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    
    // Usuarios nuevos este mes
    const newUsersResult = await pool.query(`
      SELECT COUNT(*) FROM users 
      WHERE role = 'user' 
      AND created_at >= date_trunc('month', CURRENT_DATE)
    `);

    // Ventas por día (últimos 7 días)
    const salesByDayResult = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    // Ventas por mes (últimos 6 meses)
    const salesByMonthResult = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        TO_CHAR(created_at, 'Mon') as month_name,
        COUNT(*) as orders,
        COALESCE(SUM(total), 0) as revenue
      FROM orders
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM'), TO_CHAR(created_at, 'Mon')
      ORDER BY month ASC
    `);

    // Productos más vendidos
    const topProductsResult = await pool.query(`
      SELECT 
        p.id,
        p.name,
        SUM(oi.quantity) as total_sold,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      GROUP BY p.id, p.name
      ORDER BY total_sold DESC
      LIMIT 5
    `);

    // Pedidos recientes
    const recentOrdersResult = await pool.query(`
      SELECT 
        o.id,
        o.total,
        o.status,
        o.created_at,
        u.name as customer_name,
        u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Pedidos por estado
    const ordersByStatusResult = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM orders
      GROUP BY status
    `);

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      newUsersThisMonth: parseInt(newUsersResult.rows[0].count),
      salesByDay: salesByDayResult.rows,
      salesByMonth: salesByMonthResult.rows,
      topProducts: topProductsResult.rows,
      recentOrders: recentOrdersResult.rows,
      ordersByStatus: ordersByStatusResult.rows
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ error: "Error al obtener estadísticas" });
  }
});

// Cambiar rol de usuario
router.patch("/:id/role", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ error: "Rol inválido" });
    }

    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role",
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar rol:", error);
    res.status(500).json({ error: "Error al actualizar rol" });
  }
});

export default router;
