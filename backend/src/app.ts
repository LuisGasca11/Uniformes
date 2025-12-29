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
import wishlistRoutes from "./routes/wishlist.routes";
import addressesRoutes from "./routes/addresses.routes";
import checkoutRoutes from "./routes/checkout.routes";
import usersRoutes from "./routes/users.routes";
import contactRoutes from "./routes/contact.routes";

import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static(path.join(process.cwd(), "public")));

app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/order-items", orderItemsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/variants", variantsRoutes);
app.use("/api/cart", cartRouter);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressesRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/contact", contactRoutes);

export default app;
