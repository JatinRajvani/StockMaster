import express from "express";
import {
  createLocation,
  getAllLocations,
  getLocationById,
  deleteLocation,
} from "../controllers/locationController.js";

const router = express.Router();

// CREATE
router.post("/create", createLocation);

// GET ALL
router.get("/all", getAllLocations);

// GET SINGLE (by locationId)
router.get("/:id", getLocationById);

// DELETE (by locationId)
router.delete("/:id", deleteLocation);

export default router;
