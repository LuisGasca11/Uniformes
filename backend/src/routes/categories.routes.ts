import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  getProductsByCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categories.controller";
import pool from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { auth, isAdmin } from "../middleware/auth";

const router = Router();

router.get("/slug/:slug", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM categories WHERE slug = $1 AND is_active = true",
      [req.params.slug]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json(rows[0]);
  } catch (err) {
    console.error("Error /categories/slug:", err);
    res.status(500).json({ error: "Error fetching category" });
  }
});


router.get("/", getAllCategories);

router.get("/:id/products", getProductsByCategory);

router.get("/:id", getCategoryById);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = "uploads/categories";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/", auth, isAdmin, upload.single("image"), createCategory);
router.put("/:id", auth, isAdmin, upload.single("image"), updateCategory);
router.delete("/:id", auth, isAdmin, deleteCategory);

export default router;
