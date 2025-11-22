import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import warehouseRoutes from "./routes/warehouseRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/receipts", receiptRoutes);
export default app;
