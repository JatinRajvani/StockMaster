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

    const { username, email, password } = req.body;

    // 🔥 2. Check if email exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // 🔥 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 4. Create the user
    const user = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      activitySummary: {
        receipts: 0,
        deliveries: 0,
        transfers: 0,
        adjustments: 0,
      },
    };

    const result = await UserModel.createUser(user);

    // Auto-login after signup: set lastLogin and issue JWT
    const userId = result.insertedId;
    await UserModel.updateLastLogin(userId);
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const created = await UserModel.findById(userId);
    res.json({
      message: "Signup successful",
      token,
      user: {
        id: created._id,
        username: created.username,
        email: created.email,
        createdAt: created.createdAt,
        lastLogin: created.lastLogin,
        activitySummary: created.activitySummary,
      },
    });
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

    await UserModel.updateLastLogin(user._id);
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: new Date(),
        activitySummary: user.activitySummary || { receipts: 0, deliveries: 0, transfers: 0, adjustments: 0 },
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
      id: user._id,
      username: user.username,
      email: user.email,
      mobileNumber: user.mobileNumber || null,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      activitySummary: user.activitySummary || { receipts: 0, deliveries: 0, transfers: 0, adjustments: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, mobileNumber } = req.body || {};
    const update = {};
    if (typeof username !== 'undefined') update.username = username;
    if (typeof mobileNumber !== 'undefined') update.mobileNumber = mobileNumber;

    await UserModel.updateUser(req.userId, update);
    const user = await UserModel.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      mobileNumber: user.mobileNumber || null,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      activitySummary: user.activitySummary || { receipts: 0, deliveries: 0, transfers: 0, adjustments: 0 },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
