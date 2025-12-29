import { Router } from "express";
import pool from "../db";
import { sendEmail, emailTemplates } from "../services/email.service";

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

// =============================================
// CHECKOUT - Crear orden con dirección de envío
// =============================================
router.post("/", verifyToken, async (req: any, res) => {
  const client = await pool.connect();
  
  try {
    const userId = req.user.id;
    const { 
      address_id, 
      payment_method, 
      notes 
    } = req.body;

    await client.query("BEGIN");

    // 1. Obtener carrito del usuario
    const cartResult = await client.query(
      `SELECT id FROM cart WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (cartResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "No tienes un carrito" });
    }

    const cartId = cartResult.rows[0].id;

    // 2. Obtener items del carrito
    const itemsResult = await client.query(
      `SELECT ci.*, pv.product_id, pv.size, pv.color_name, pv.color_hex, pv.stock,
              p.name as product_name, p.price,
              (SELECT image_url FROM product_images WHERE product_id = pv.product_id ORDER BY id LIMIT 1) as image
       FROM cart_items ci
       JOIN product_variants pv ON ci.variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cartId]
    );

    if (itemsResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "El carrito está vacío" });
    }

    // 3. Verificar stock y calcular totales
    let subtotal = 0;
    const items = itemsResult.rows;
    
    for (const item of items) {
      if (item.stock < item.quantity) {
        await client.query("ROLLBACK");
        return res.status(400).json({ 
          error: `Stock insuficiente para ${item.product_name} (${item.size})` 
        });
      }
      subtotal += parseFloat(item.price) * item.quantity;
    }

    // 3. Obtener y validar dirección de envío
    let addressSnapshot = null;
    if (address_id) {
      const addressResult = await client.query(
        `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
        [address_id, userId]
      );

      if (addressResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({ error: "Dirección no encontrada" });
      }

      // Crear snapshot de la dirección (copia al momento del pedido)
      const addr = addressResult.rows[0];
      addressSnapshot = {
        full_name: addr.full_name,
        phone: addr.phone,
        street: addr.street,
        exterior_number: addr.exterior_number,
        interior_number: addr.interior_number,
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
        postal_code: addr.postal_code,
        country: addr.country,
        references_text: addr.references_text
      };
    }

    // 4. Calcular costo de envío (ejemplo: gratis arriba de $500)
    const shippingCost = subtotal >= 500 ? 0 : 99;
    const total = subtotal + shippingCost;

    // 5. Crear la orden
    const orderResult = await client.query(
      `INSERT INTO orders (
        user_id, total, subtotal, shipping_cost, status, 
        shipping_address_id, shipping_address_snapshot,
        payment_method, payment_status, notes, created_at
      ) VALUES ($1, $2, $3, $4, 'pending', $5, $6, $7, 'pending', $8, NOW())
      RETURNING *`,
      [
        userId, 
        total, 
        subtotal, 
        shippingCost,
        address_id || null,
        addressSnapshot ? JSON.stringify(addressSnapshot) : null,
        payment_method || 'pending',
        notes || null
      ]
    );

    const order = orderResult.rows[0];

    // 6. Crear order items y actualizar stock
    for (const item of items) {
      // Insertar item (incluir product_id para el admin)
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id, item.variant_id, item.quantity, item.price]
      );

      // Actualizar stock
      await client.query(
        `UPDATE product_variants SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.variant_id]
      );
    }

    // 7. Vaciar carrito (eliminar items)
    await client.query(`DELETE FROM cart_items WHERE cart_id = $1`, [cartId]);

    await client.query("COMMIT");

    // Devolver orden completa con items
    const fullOrder = {
      ...order,
      items: items.map(item => ({
        id: item.id,
        name: item.product_name,
        size: item.size,
        color_name: item.color_name,
        color_hex: item.color_hex,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      }))
    };

    // Enviar email de confirmación de pedido
    const userResult = await pool.query(
      "SELECT email, name FROM users WHERE id = $1",
      [userId]
    );
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      sendEmail({
        to: user.email,
        subject: `¡Pedido #${order.id} confirmado! - FYTTSA`,
        html: emailTemplates.orderConfirmation(
          order.id,
          fullOrder.items,
          total,
          addressSnapshot
        ),
      }).catch(err => console.error("Error enviando email de confirmación:", err));
    }

    return res.status(201).json(fullOrder);

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("CHECKOUT ERROR:", error);
    res.status(500).json({ error: "Error al procesar el pedido" });
  } finally {
    client.release();
  }
});

// =============================================
// STRIPE - Crear Payment Intent (preparado para Stripe)
// =============================================
router.post("/create-payment-intent", verifyToken, async (req: any, res) => {
  try {
    const { order_id } = req.body;
    const userId = req.user.id;

    // Obtener orden
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [order_id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    const order = orderResult.rows[0];

    // TODO: Implementar Stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: Math.round(order.total * 100), // Stripe usa centavos
    //   currency: 'mxn',
    //   metadata: { order_id: order.id, user_id: userId }
    // });

    // Por ahora, simular respuesta
    return res.json({
      message: "Stripe no configurado. Configura STRIPE_SECRET_KEY en .env",
      clientSecret: null,
      // clientSecret: paymentIntent.client_secret, // Descomentar con Stripe
    });

  } catch (error) {
    console.error("CREATE PAYMENT INTENT ERROR:", error);
    res.status(500).json({ error: "Error al crear intento de pago" });
  }
});

// =============================================
// STRIPE - Webhook (para recibir confirmaciones de pago)
// =============================================
router.post("/webhook", async (req, res) => {
  // TODO: Implementar Stripe Webhook
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const sig = req.headers['stripe-signature'];
  // const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  // let event;
  // try {
  //   event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  // } catch (err) {
  //   return res.status(400).send(`Webhook Error: ${err.message}`);
  // }

  // switch (event.type) {
  //   case 'payment_intent.succeeded':
  //     const paymentIntent = event.data.object;
  //     await pool.query(
  //       `UPDATE orders SET payment_status = 'paid', payment_id = $1, status = 'processing' 
  //        WHERE id = $2`,
  //       [paymentIntent.id, paymentIntent.metadata.order_id]
  //     );
  //     break;
  //   case 'payment_intent.payment_failed':
  //     // Manejar pago fallido
  //     break;
  // }

  return res.json({ received: true });
});

// =============================================
// Confirmar pago manual (para testing sin Stripe)
// =============================================
router.post("/confirm-payment", verifyToken, async (req: any, res) => {
  try {
    const { order_id, payment_method } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      `UPDATE orders SET 
        payment_status = 'paid', 
        payment_method = $3,
        status = 'processing'
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [order_id, userId, payment_method || 'manual']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("CONFIRM PAYMENT ERROR:", error);
    res.status(500).json({ error: "Error al confirmar pago" });
  }
});

export default router;
