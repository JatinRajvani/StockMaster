import { getDB } from "../config/db.js";

export const ProductModel = {
  async createProduct(data) {
    const db = getDB();
    data.createdAt = new Date();
    data.updatedAt = new Date();
    return db.collection("products").insertOne(data);
  },

  async getAllProducts() {
    const db = getDB();
    return db.collection("products").find().toArray();
  },

  async findByProductId(productId) {
    const db = getDB();
    return db.collection("products").findOne({ productId });
  },

  async updateProduct(productId, data) {
    const db = getDB();
    data.updatedAt = new Date();

    return db.collection("products").updateOne(
      { productId },
      { $set: data }
    );
  },

  async deleteProduct(productId) {
    const db = getDB();
    return db.collection("products").deleteOne({ productId });
  },
};
