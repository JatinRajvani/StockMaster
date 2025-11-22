import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { UserModel } from "../models/userModel.js";

export const registerUser = async (req, res) => {
  try {
    // 🔥 1. Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    // 🔥 2. Check if email exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // 🔥 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 4. Create the user
    const user = {
      name,
      email,
      password: hashedPassword,
      phone,
      wishlist: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await UserModel.createUser(user);

    res.json({ message: "Signup successful. Please log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findByEmail(email);
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        wishlist: user.wishlist,
      },
    });
  } catch (error) {
    console.log("error :", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      name: user.name,
      email: user.email,
      phone: user.phone,
      wishlist: user.wishlist,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
