import { ProductModel } from "../models/productModel.js";
import { ObjectId } from "mongodb";

// CREATE PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, sku, categoryId, unit, reorderLevel, currentStock } = req.body;

    // 1️⃣ Get all products to generate next productId
    const products = await ProductModel.getAllProducts();
    const nextNumber = products.length + 1;

    // 2️⃣ Generate productId like PR001
    const productId = `PR${String(nextNumber).padStart(3, "0")}`;

    const product = {
      productId,          // ✔ custom ID (PR001)
      name,
      sku,
      categoryId,         // ✔ now string CAT001 (NO ObjectId)
      unit,
      currentStock,
      reorderLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await ProductModel.createProduct(product);

    res.json({
      message: "Product created successfully",
      product: {
        _id: result.insertedId,
        ...product,
      },
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// GET ALL PRODUCTS
export const getAllProducts = async (req, res) => {
  try {
    const products = await ProductModel.getAllProducts();
    res.json({
      message: "Fetched successfully",
      products,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET PRODUCT BY productId
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params; // PR001

    const product = await ProductModel.findByProductId(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Fetched successfully",
      product,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// UPDATE PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params; // PR001
    const updates = req.body;

    if (updates.categoryId) {
      updates.categoryId = new ObjectId(updates.categoryId);
    }

    const result = await ProductModel.updateProduct(id, updates);

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params; // PR001

    const result = await ProductModel.deleteProduct(id);

    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
