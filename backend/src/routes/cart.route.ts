import { Router } from "express";
import { auth } from "../middleware/auth";

import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  checkout
} from "../controllers/cart.controller";

const router = Router();

router.use(auth);

router.get("/", getCart);

router.post("/add", addToCart);

router.post("/checkout", checkout);

router.patch("/item/:itemId", updateCartItem);

router.delete("/item/:itemId", removeCartItem);

router.delete("/clear", clearCart);

export default router;
