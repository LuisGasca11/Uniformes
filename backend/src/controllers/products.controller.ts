import { Request, Response } from "express";
import pool from "../db";
import fs from "fs";

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const { category, limit } = req.query;
    
    let whereClause = "";
    const params: any[] = [];
    
    if (category) {
      params.push(Number(category));
      whereClause = `WHERE p.category_id = $${params.length}`;
    }
    
    let limitClause = "";
    if (limit) {
      params.push(Number(limit));
      limitClause = `LIMIT $${params.length}`;
    }

    const products = await pool.query(`
      SELECT 
        p.*, 
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY p.id
      ${limitClause}
    `, params);

    const fullProducts = await Promise.all(
      products.rows.map(async (p) => {
        const images = await pool.query(
          "SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order, id",
          [p.id]
        );

        const variants = await pool.query(
          `
          SELECT 
            id,
            color_name,
            color_hex,
            size,
            gender,
            stock,
            code,
            key_code
          FROM product_variants
          WHERE product_id = $1
          ORDER BY id
          `,
          [p.id]
        );

        return {
          ...p,
          images: images.rows,
          variants: variants.rows,
        };
      })
    );

    res.json(fullProducts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching products" });
  }
};


export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description = "",
      price,
      sold_info = "",
      category_id,
      brand = "",
    } = req.body;

    if (!name || price == null) {
      return res.status(400).json({ error: "Nombre y precio son obligatorios" });
    }

    const categoryIdNum = category_id ? Number(category_id) : null;

    const result = await pool.query(
      `
      INSERT INTO products
      (name, description, price, sold_info, category_id, brand)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [name, description, price, sold_info, categoryIdNum, brand]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR createProduct:", err);
    res.status(500).json({ error: "Error creating product" });
  }
};


export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description = "",
      price,
      sold_info = "",
      category_id = null,
      brand = "",
    } = req.body;

    const result = await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        description = $2,
        price = $3,
        sold_info = $4,
        category_id = $5,
        brand = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [name, description, price, sold_info, category_id, brand, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ error: "Error updating product" });
  }
};



export const deleteProduct = async (req: Request, res: Response) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { id } = req.params;

    const images = await client.query(
      "SELECT image_url FROM product_images WHERE product_id = $1",
      [id]
    );

    images.rows.forEach((img) => {
      try {
        fs.unlinkSync(`./public/uploads/${img.image_url}`);
      } catch (err) {
        console.warn("⚠ No se pudo borrar imagen:", img.image_url);
      }
    });

    await client.query(
      "DELETE FROM product_images WHERE product_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM product_variants WHERE product_id = $1",
      [id]
    );

    await client.query(
      "DELETE FROM products WHERE id = $1",
      [id]
    );

    await client.query("COMMIT");

    res.json({ success: true });

  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Error deleting product" });
  } finally {
    client.release();
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await pool.query(
      `SELECT 
        p.*, 
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1`,
      [id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const p = product.rows[0];

    const images = await pool.query(
      "SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order, id",
      [id]
    );

    const variants = await pool.query(
      `
      SELECT
        id,
        product_id,
        color_name,
        color_hex,
        size,
        gender,
        stock,
        code,
        key_code
      FROM product_variants
      WHERE product_id = $1
      ORDER BY color_hex, size
      `,
      [id]
    );

    res.json({
      ...p,
      images: images.rows,
      variants: variants.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching product" });
  }
};