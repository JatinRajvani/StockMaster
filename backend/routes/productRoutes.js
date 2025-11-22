import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

// CREATE PRODUCT
router.post("/", createProduct);

// GET ALL PRODUCTS
router.get("/", getAllProducts);

// GET PRODUCT BY productId (PR001...)
router.get("/:id", getProductById);

// UPDATE PRODUCT BY productId
router.put("/:id", updateProduct);

// DELETE PRODUCT BY productId
router.delete("/:id", deleteProduct);

export default router;
