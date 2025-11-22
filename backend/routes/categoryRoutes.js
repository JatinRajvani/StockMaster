import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
} from "../controllers/categoryController.js";

const router = express.Router();

// CREATE
router.post("/create", createCategory);

// GET ALL
router.get("/all", getAllCategories);

// GET SINGLE
router.get("/:id", getCategoryById);

export default router;
