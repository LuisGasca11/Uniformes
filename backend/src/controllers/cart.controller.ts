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

    // Validar que el producto existe
    const productCheck = await pool.query(
      "SELECT id, name, price FROM products WHERE id = $1",
      [product_id]
    );
    if (productCheck.rowCount === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Validar que la variante existe y pertenece al producto
    const variantCheck = await pool.query(
      "SELECT id, stock FROM product_variants WHERE id = $1 AND product_id = $2",
      [variant_id, product_id]
    );
    if (variantCheck.rowCount === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    const availableStock = variantCheck.rows[0].stock;

    // Obtener o crear carrito
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

    // Verificar si ya existe el item en el carrito
    const existing = await pool.query(
      `
      SELECT id, quantity
      FROM cart_items
      WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3
      `,
      [cartId, product_id, variant_id]
    );

    let totalRequestedQty = quantity;
    if (existing.rowCount && existing.rowCount > 0) {
      totalRequestedQty += existing.rows[0].quantity;
    }

    // Validar stock disponible
    if (totalRequestedQty > availableStock) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Solo hay ${availableStock} unidades disponibles.`,
        availableStock 
      });
    }

    if (existing.rowCount && existing.rowCount > 0) {
      const itemId = existing.rows[0].id;

      await pool.query(
        "UPDATE cart_items SET quantity=$1 WHERE id=$2",
        [totalRequestedQty, itemId]
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
    // @ts-ignore
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ error: "La cantidad debe ser al menos 1" });
    }

    // Verificar que el item pertenece al usuario
    const itemCheck = await pool.query(
      `
      SELECT ci.id, ci.variant_id, c.user_id
      FROM cart_items ci
      JOIN cart c ON c.id = ci.cart_id
      WHERE ci.id = $1
      `,
      [itemId]
    );

    if (itemCheck.rowCount === 0) {
      return res.status(404).json({ error: "Item no encontrado" });
    }

    if (itemCheck.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Verificar stock disponible
    const variantId = itemCheck.rows[0].variant_id;
    const stockCheck = await pool.query(
      "SELECT stock FROM product_variants WHERE id = $1",
      [variantId]
    );

    if (stockCheck.rowCount === 0) {
      return res.status(404).json({ error: "Variante no encontrada" });
    }

    const availableStock = stockCheck.rows[0].stock;
    if (quantity > availableStock) {
      return res.status(400).json({ 
        error: `Stock insuficiente. Solo hay ${availableStock} unidades disponibles.`,
        availableStock 
      });
    }

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


export const checkout = async (req: Request, res: Response) => {
  const client = await pool.connect();
  
  try {
    // @ts-ignore
    const userId = req.user.id;

    await client.query("BEGIN");

    // Obtener carrito del usuario
    const cartResult = await client.query(
      "SELECT id FROM cart WHERE user_id = $1 LIMIT 1",
      [userId]
    );

    if (cartResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No tienes un carrito" });
    }

    const cartId = cartResult.rows[0].id;

    // Obtener items del carrito con info de producto y variante
    const itemsResult = await client.query(
      `
      SELECT 
        ci.id,
        ci.product_id,
        ci.variant_id,
        ci.quantity,
        p.name,
        p.price,
        v.stock,
        v.size,
        v.color_name
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN product_variants v ON v.id = ci.variant_id
      WHERE ci.cart_id = $1
      `,
      [cartId]
    );

    if (itemsResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Tu carrito está vacío" });
    }

    const items = itemsResult.rows;

    // Validar stock de todos los items
    for (const item of items) {
      if (item.quantity > item.stock) {
        await client.query("ROLLBACK");
        return res.status(400).json({ 
          error: `Stock insuficiente para "${item.name}" (${item.size}, ${item.color_name}). Solo hay ${item.stock} unidades disponibles.`
        });
      }
    }

    // Calcular total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Crear orden
    const orderResult = await client.query(
      `
      INSERT INTO orders (user_id, total, status, created_at, updated_at)
      VALUES ($1, $2, 'pending', NOW(), NOW())
      RETURNING id
      `,
      [userId, total]
    );

    const orderId = orderResult.rows[0].id;

    // Crear order_items y actualizar stock
    for (const item of items) {
      // Insertar order_item
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
        VALUES ($1, $2, $3, $4, $5)
        `,
        [orderId, item.product_id, item.variant_id, item.quantity, item.price]
      );

      // Descontar stock
      await client.query(
        `
        UPDATE product_variants 
        SET stock = stock - $1 
        WHERE id = $2
        `,
        [item.quantity, item.variant_id]
      );
    }

    // Limpiar carrito
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);

    await client.query("COMMIT");

    res.json({ 
      success: true, 
      orderId,
      message: "Orden creada exitosamente",
      total
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Error al procesar la orden" });
  } finally {
    client.release();
  }
};
