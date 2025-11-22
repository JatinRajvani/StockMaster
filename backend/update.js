import { connectDB, getDB } from "./config/db.js";

const renamePgIds = async () => {
  try {
    // 1️⃣ Connect to DB
    await connectDB();

    // 2️⃣ Get DB
    const db = getDB();
    console.log("Connected to DB:", db.databaseName);

    let counter = 1;

    // 3️⃣ Loop all documents
    const cursor = db.collection("hostel").find();

    for await (const doc of cursor) {
      const newId = "PG" + String(counter).padStart(3, "0");

      await db.collection("hostel").updateOne(
        { _id: doc._id },
        { $set: { pgId: newId } }
      );

      console.log(`Updated ${doc._id} → ${newId}`);
      counter++;
    }

    console.log("All pgIds updated successfully!");

    process.exit(0); // End script cleanly
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
};

renamePgIds();
