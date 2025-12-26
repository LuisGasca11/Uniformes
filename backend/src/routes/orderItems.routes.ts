import { Router } from "express";
import {
  getItemsByOrder,
  addItemToOrder,
  updateItem,
  deleteItem,
} from "../controllers/orderItems.controller";

const router = Router();

router.get("/:orderId", getItemsByOrder);

router.post("/:orderId", addItemToOrder);

router.put("/item/:itemId", updateItem);

router.delete("/item/:itemId", deleteItem);

export default router;
