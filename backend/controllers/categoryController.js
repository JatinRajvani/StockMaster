import { CategoryModel } from "../models/categoryModel.js";
import { getNextSequence } from "../utils/getNextSequence.js";
// CREATE CATEGORY
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // 1️⃣ Get next sequence number from counters collection
    const seq = await getNextSequence("category");

    // 2️⃣ Format ID as CAT001, CAT002...
    const categoryId = `CAT${String(seq).padStart(3, "0")}`;

    const category = {
      categoryId,
      name,
      description,
      createdAt: new Date(),
    };

    await CategoryModel.createCategory(category);

    res.json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL CATEGORIES
export const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.getAllCategories();

    res.json({
      message: "Fetched successfully",
      categories,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET CATEGORY BY ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await CategoryModel.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      message: "Fetched successfully",
      category,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
