import { LocationModel } from "../models/locationModel.js";
import { ObjectId } from "mongodb";

// CREATE LOCATION
export const createLocation = async (req, res) => {
  try {
    const { warehouseId, name, type } = req.body;

    // 1️⃣ Fetch total locations → this gives the next number
    const allLocations = await LocationModel.getAllLocations();
    const nextNumber = allLocations.length + 1;

    // 2️⃣ Generate locationId like LC001, LC002...
    const locationId = `LC${String(nextNumber).padStart(3, "0")}`;

    const location = {
      locationId,
      warehouseId,
      name,
      type,
      createdAt: new Date(),
    };

    await LocationModel.createLocation(location);

    res.json({
      message: "Location created successfully",
      location,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET ALL LOCATIONS
export const getAllLocations = async (req, res) => {
  try {
    const locations = await LocationModel.getAllLocations();

    res.json({
      message: "Fetched successfully",
      locations,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// GET SINGLE LOCATION
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params; // id is locationId (e.g. LC001)

    const location = await LocationModel.findById(id);

    if (!location) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({
      message: "Fetched successfully",
      location,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE LOCATION (by locationId)
export const deleteLocation = async (req, res) => {
  try {
    const { id } = req.params; // id is locationId

    const result = await LocationModel.deleteLocation(id);

    // result.deletedCount (0 or 1) when using deleteOne
    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ message: "Location not found" });
    }

    res.json({ message: "Location deleted successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


