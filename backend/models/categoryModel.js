import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const CategoryModel = {
  async createCategory(data) {
    const db = getDB();
    data.createdAt = new Date();
    return db.collection("categories").insertOne(data);
  },

  async getAllCategories() {
    const db = getDB();
    return db.collection("categories").find().toArray();
  },

  async findById(id) {
    const db = getDB();
    return db.collection("categories").findOne({ categoryId: id });
  }
};
