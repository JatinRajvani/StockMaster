import { getDB } from "../config/db.js";

export const ReceiptModel = {
  async createReceipt(data) {
    const db = getDB();
    data.createdAt = new Date();
    data.updatedAt = new Date();
    return db.collection("receipts").insertOne(data);
  },

  async getAllReceipts() {
    const db = getDB();
    return db.collection("receipts").find().toArray();
  },

  async findByReceiptId(receiptId) {
    const db = getDB();
    return db.collection("receipts").findOne({ receiptId });
  },

  async updateReceipt(receiptId, data) {
    const db = getDB();
    data.updatedAt = new Date();
    return db.collection("receipts").updateOne(
      { receiptId },
      { $set: data }
    );
  },

  async deleteReceipt(receiptId) {
    const db = getDB();
    return db.collection("receipts").deleteOne({ receiptId });
  }
};
