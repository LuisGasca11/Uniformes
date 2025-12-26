import { Request, Response } from "express";
import pool from "../db";

export const getVariantsByProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

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
      [productId]
    );

    res.json(variants.rows);
  } catch (err) {
    console.error("ERROR GET VARIANTS:", err);
    res.status(500).json({ error: "Error fetching variants" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const productResult = await pool.query(
            `SELECT * FROM products WHERE id = $1`,
            [id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        const product = productResult.rows[0];

        const variantsResult = await pool.query(
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
                key_code  -- ¡Asegúrate de que 'code' y 'key_code' estén aquí!
            FROM product_variants
            WHERE product_id = $1
            ORDER BY color_hex, size
            `,
            [id]
        );

        const productWithVariants = {
            ...product,
            variants: variantsResult.rows,
        };

        res.json(productWithVariants);
    } catch (err) {
        console.error("ERROR GET PRODUCT BY ID:", err);
        res.status(500).json({ error: "Error fetching product" });
    }
};

export const createVariant = async (req: Request, res: Response) => {
  try {
    const {
      product_id,
      color_name,
      color_hex,
      size,
      gender,
      stock,
      code,
      key_code,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO product_variants
      (product_id, color_name, color_hex, size, gender, stock, code, key_code)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *
      `,
      [product_id, color_name, color_hex, size, gender, stock, code, key_code]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR CREATE VARIANT:", err);
    res.status(500).json({ error: "Error creating variant" });
  }
};

export const updateVariant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      color_name,
      color_hex,
      size,
      gender,
      stock,
      code,
      key_code,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE product_variants
      SET
        color_name = $1,
        color_hex = $2,
        size = $3,
        gender = $4,
        stock = $5,
        code = $6,
        key_code = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
      `,
      [color_name, color_hex, size, gender, stock, code, key_code, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR UPDATE VARIANT:", err);
    res.status(500).json({ error: "Error updating variant" });
  }
};

export const deleteVariant = async (req: Request, res: Response) => {
  try {
    await pool.query("DELETE FROM product_variants WHERE id=$1", [
      req.params.id,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error("ERROR DELETE VARIANT:", err);
    res.status(500).json({ error: "Error deleting variant" });
  }
};
