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

// GET - Obtener todas las direcciones del usuario
router.get("/", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT * FROM addresses 
       WHERE user_id = $1 
       ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);
    res.status(500).json({ error: "Error al obtener direcciones" });
  }
});

// GET - Obtener una dirección específica
router.get("/:id", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("GET ADDRESS ERROR:", error);
    res.status(500).json({ error: "Error al obtener dirección" });
  }
});

// POST - Crear nueva dirección
router.post("/", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      label,
      full_name,
      phone,
      street,
      exterior_number,
      interior_number,
      neighborhood,
      city,
      state,
      postal_code,
      country,
      references_text,
      is_default
    } = req.body;

    // Validaciones básicas
    if (!full_name || !phone || !street || !exterior_number || !neighborhood || !city || !state || !postal_code) {
      return res.status(400).json({ error: "Campos requeridos incompletos" });
    }

    // Si es default, quitar default de otras direcciones
    if (is_default) {
      await pool.query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1`,
        [userId]
      );
    }

    // Si es la primera dirección, hacerla default
    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM addresses WHERE user_id = $1`,
      [userId]
    );
    const isFirstAddress = parseInt(countResult.rows[0].count) === 0;

    const result = await pool.query(
      `INSERT INTO addresses (
        user_id, label, full_name, phone, street, exterior_number, 
        interior_number, neighborhood, city, state, postal_code, 
        country, references_text, is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        userId,
        label || 'Casa',
        full_name,
        phone,
        street,
        exterior_number,
        interior_number || null,
        neighborhood,
        city,
        state,
        postal_code,
        country || 'México',
        references_text || null,
        is_default || isFirstAddress
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);
    res.status(500).json({ error: "Error al crear dirección" });
  }
});

// PUT - Actualizar dirección
router.put("/:id", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      label,
      full_name,
      phone,
      street,
      exterior_number,
      interior_number,
      neighborhood,
      city,
      state,
      postal_code,
      country,
      references_text,
      is_default
    } = req.body;

    // Verificar que la dirección existe y pertenece al usuario
    const existsResult = await pool.query(
      `SELECT id FROM addresses WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (existsResult.rows.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    // Si es default, quitar default de otras direcciones
    if (is_default) {
      await pool.query(
        `UPDATE addresses SET is_default = false WHERE user_id = $1 AND id != $2`,
        [userId, id]
      );
    }

    const result = await pool.query(
      `UPDATE addresses SET
        label = COALESCE($3, label),
        full_name = COALESCE($4, full_name),
        phone = COALESCE($5, phone),
        street = COALESCE($6, street),
        exterior_number = COALESCE($7, exterior_number),
        interior_number = $8,
        neighborhood = COALESCE($9, neighborhood),
        city = COALESCE($10, city),
        state = COALESCE($11, state),
        postal_code = COALESCE($12, postal_code),
        country = COALESCE($13, country),
        references_text = $14,
        is_default = COALESCE($15, is_default),
        updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING *`,
      [
        id,
        userId,
        label,
        full_name,
        phone,
        street,
        exterior_number,
        interior_number,
        neighborhood,
        city,
        state,
        postal_code,
        country,
        references_text,
        is_default
      ]
    );

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);
    res.status(500).json({ error: "Error al actualizar dirección" });
  }
});

// DELETE - Eliminar dirección
router.delete("/:id", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    return res.json({ message: "Dirección eliminada" });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);
    res.status(500).json({ error: "Error al eliminar dirección" });
  }
});

// PUT - Establecer dirección como predeterminada
router.put("/:id/default", verifyToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Quitar default de todas
    await pool.query(
      `UPDATE addresses SET is_default = false WHERE user_id = $1`,
      [userId]
    );

    // Establecer esta como default
    const result = await pool.query(
      `UPDATE addresses SET is_default = true, updated_at = NOW() 
       WHERE id = $1 AND user_id = $2 
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Dirección no encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("SET DEFAULT ADDRESS ERROR:", error);
    res.status(500).json({ error: "Error al establecer dirección predeterminada" });
  }
});

export default router;
