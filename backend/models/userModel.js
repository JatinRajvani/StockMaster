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
    return db.collection("users").insertOne(data);
  },

  async updateUser(id, updateData) {
    const db = getDB();
    updateData.updatedAt = new Date();
    return db.collection("users").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
  }
};
