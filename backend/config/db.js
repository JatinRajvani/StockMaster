import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const client = new MongoClient(process.env.MONGO_URI);
let database;

export const connectDB = async () => {
  try {
    await client.connect();
    database = client.db("StockMaster");
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("DB Connection Error:", err);
  }
};

export const getDB = () => database;
