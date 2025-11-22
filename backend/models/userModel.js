import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export const UserModel = {
  async findByEmail(email) {
    const db = getDB();
    return db.collection("users").findOne({ email });
  },

  async findById(id) {
    const db = getDB();
    return db.collection("users").findOne({ _id: new ObjectId(id) });
  },

  async createUser(data) {
    const db = getDB();
    data.createdAt = new Date();
    data.updatedAt = new Date();
    if (!data.activitySummary) {
      data.activitySummary = {
        receipts: 0,
        deliveries: 0,
        transfers: 0,
        adjustments: 0,
      };
    }
    if (typeof data.lastLogin === 'undefined') {
      data.lastLogin = null;
    }
    return db.collection("users").insertOne(data);
  },

  async updateUser(id, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    return db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  },

  async updateLastLogin(id, when = new Date()) {
    const db = getDB();
    return db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: { lastLogin: when, updatedAt: new Date() } }
    );
  },
};
