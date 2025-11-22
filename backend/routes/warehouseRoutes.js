import express from "express";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
} from "../controllers/warehouseController.js";

const router = express.Router();

// CREATE
router.post("/create", createWarehouse);

// GET ALL
router.get("/all", getAllWarehouses);

// GET SINGLE
router.get("/:id", getWarehouseById);

export default router;
