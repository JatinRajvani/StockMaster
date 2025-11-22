import { getDB } from "../config/db.js";

export const getNextSequence = async (name) => {
  const db = getDB();

  const result = await db.collection("counters").findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  return result.seq;
};
