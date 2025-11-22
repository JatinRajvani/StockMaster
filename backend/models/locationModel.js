import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const LocationModel = {
  async createLocation(data) {
    const db = getDB();
    data.createdAt = new Date();
    return db.collection("locations").insertOne(data);
  },

  async getAllLocations() {
    const db = getDB();
    return db.collection("locations").find().toArray();
  },

  async findById(id) {
    const db = getDB();
    return db.collection("locations").findOne({ 
locationId: id });
  },

  async findByWarehouse(warehouseId) {
    const db = getDB();
    return db
      .collection("locations")
      .find({ warehouseId: warehouseId })
      .toArray();
  }
};
