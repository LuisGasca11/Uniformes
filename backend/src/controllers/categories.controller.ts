import { Request, Response } from "express";
import pool from "../db";
import fs from "fs";
import path from "path";

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await pool.query(
      "SELECT * FROM categories WHERE is_active = true ORDER BY display_order ASC, name ASC"
    );
    res.json(categories.rows);
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al obtener categoría:", error);
    res.status(500).json({ error: "Error al obtener categoría" });
  }
};

export const getProductsByCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const products = await pool.query(
      `SELECT 
        p.*, 
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.category_id = $1
      ORDER BY p.id`,
      [id]
    );

    const fullProducts = await Promise.all(
      products.rows.map(async (p) => {
        const images = await pool.query(
          "SELECT id, image_url FROM product_images WHERE product_id = $1 ORDER BY sort_order, id",
          [p.id]
        );

        const variants = await pool.query(
          `SELECT id, color_name, color_hex, size, stock, gender
           FROM product_variants
           WHERE product_id = $1
           ORDER BY id`,
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
  } catch (error) {
    console.error("Error productos por categoría:", error);
    res.status(500).json({ error: "Error obteniendo productos por categoría" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, slug, description, display_order, parent_id } = req.body;
    const image_url = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, image_url, display_order, parent_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [name, slug || name.toLowerCase().replace(/\s+/g, "-"), description, image_url, display_order || 0, parent_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error al crear categoría:", error);
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, display_order, is_active, parent_id } = req.body;
    const safeSlug =
    slug || name.toLowerCase().trim().replace(/\s+/g, "-");

    const currentCategory = await pool.query(
      "SELECT image_url FROM categories WHERE id = $1",
      [id]
    );

    if (currentCategory.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    let image_url = currentCategory.rows[0].image_url;

    if (req.file) {
      if (image_url) {
        const oldImagePath = path.join("uploads/categories", image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      image_url = req.file.filename;
    }

    const result = await pool.query(
      `UPDATE categories 
      SET name = $1, slug = $2, description = $3, image_url = $4, 
          display_order = $5, is_active = $6, parent_id = $7
      WHERE id = $8 
      RETURNING *`,
      [
        name,
        safeSlug,
        description,
        image_url,
        display_order || 0,
        is_active ?? true,
        parent_id || null,
        id
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error al actualizar categoría:", error);
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await pool.query(
      "SELECT image_url FROM categories WHERE id = $1",
      [id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ error: "Categoría no encontrada" });
    }

    if (category.rows[0].image_url) {
      const imagePath = path.join("uploads/categories", category.rows[0].image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.query("DELETE FROM categories WHERE id = $1", [id]);
    res.json({ message: "Categoría eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};