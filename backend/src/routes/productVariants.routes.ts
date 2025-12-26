import { Router } from "express";
import {
  getVariantsByProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/productVariants.controller";

const router = Router();

router.get("/:productId", getVariantsByProduct);
router.post("/", createVariant);
router.put("/:id", updateVariant);
router.delete("/:id", deleteVariant);

export default router;
