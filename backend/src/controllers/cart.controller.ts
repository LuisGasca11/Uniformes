import { Request, Response } from "express";
import pool from "../db";

export const getCart = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1 LIMIT 1",
      [userId]
    );

    let cartId: number;

    if (cart.rowCount === 0) {
      const newCart = await pool.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cart.rows[0].id;
    }

    const items = await pool.query(
      `
      SELECT 
        ci.id,
        ci.product_id,
        ci.variant_id,
        ci.quantity,
        p.name,
        p.price,
        v.color_name,
        v.color_hex,
        v.size,
        (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) AS image
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN product_variants v ON v.id = ci.variant_id
      WHERE ci.cart_id = $1
      ORDER BY ci.id
      `,
      [cartId]
    );

    res.json({ id: cartId, items: items.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching cart" });
  }
};


export const addToCart = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { product_id, variant_id, quantity } = req.body;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id = $1 LIMIT 1",
      [userId]
    );

    let cartId: number;

    if (cart.rowCount === 0) {
      const newCart = await pool.query(
        "INSERT INTO cart (user_id) VALUES ($1) RETURNING id",
        [userId]
      );
      cartId = newCart.rows[0].id;
    } else {
      cartId = cart.rows[0].id;
    }

    const existing = await pool.query(
      `
      SELECT id, quantity
      FROM cart_items
      WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3
      `,
      [cartId, product_id, variant_id]
    );

    if (existing.rowCount > 0) {
      const itemId = existing.rows[0].id;
      const newQty = existing.rows[0].quantity + quantity;

      await pool.query(
        "UPDATE cart_items SET quantity=$1 WHERE id=$2",
        [newQty, itemId]
      );

      return res.json({ success: true, updated: true });
    }

    await pool.query(
      `
      INSERT INTO cart_items (cart_id, product_id, variant_id, quantity)
      VALUES ($1, $2, $3, $4)
      `,
      [cartId, product_id, variant_id, quantity]
    );

    res.json({ success: true, added: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding item" });
  }
};


export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    await pool.query(
      "UPDATE cart_items SET quantity=$1 WHERE id=$2",
      [quantity, itemId]
    );

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating item" });
  }
};


export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    await pool.query("DELETE FROM cart_items WHERE id=$1", [itemId]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error removing item" });
  }
};


export const clearCart = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    const cart = await pool.query(
      "SELECT id FROM cart WHERE user_id=$1 LIMIT 1",
      [userId]
    );

    if (cart.rowCount === 0) return res.json({ success: true });

    await pool.query("DELETE FROM cart_items WHERE cart_id=$1", [
      cart.rows[0].id,
    ]);

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error clearing cart" });
  }
};
