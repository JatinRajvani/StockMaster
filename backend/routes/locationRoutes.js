import express from "express";
import {
  createLocation,
  getAllLocations,
  getLocationById,
} from "../controllers/locationController.js";

const router = express.Router();

// CREATE
router.post("/create", createLocation);

// GET ALL
router.get("/all", getAllLocations);

// GET SINGLE
router.get("/:id", getLocationById);

export default router;
