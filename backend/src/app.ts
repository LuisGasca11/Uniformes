import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/categories.routes";
import orderRoutes from "./routes/orders.routes";
import orderItemsRoutes from "./routes/orderItems.routes";
import variantsRoutes from "./routes/productVariants.routes";
import productsRoutes from "./routes/products.routes";
import cartRouter from "./routes/cart.route";
import searchRoutes from "./routes/search.routes";

import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use(
  "/uploads/categories",
  express.static(path.join(process.cwd(), "uploads/categories"))
)

app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/variants", variantsRoutes);
app.use("/api/cart", cartRouter);

export default app;
