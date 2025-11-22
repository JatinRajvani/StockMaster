import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const WarehouseModel = {
  async createWarehouse(data) {
    const db = getDB();
    data.createdAt = new Date();
    return db.collection("warehouses").insertOne(data);
  },

  async getAllWarehouses() {
    const db = getDB();
    return db.collection("warehouses").find().toArray();
  },

  async findById(id) {
    const db = getDB();
    return db.collection("warehouses").findOne({ warehouseId: id });
  }
};
