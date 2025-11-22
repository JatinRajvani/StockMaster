import app from "./app.js";
import { connectDB } from "./config/db.js";

const start = async () => {
  await connectDB();
  app.listen(5000, () => {
    console.log("Server running at http://localhost:5000");
  });
};

start();
