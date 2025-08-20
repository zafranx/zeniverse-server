import mongoose from "mongoose";
import Admin from "../models/Admin";
import connectDB from "../config/database";
import dotenv from "dotenv";

dotenv.config();

const createInitialAdmin = async () => {
  try {
    await connectDB();

    // Check if any admin exists
    const existingAdmin = await Admin.findOne({});
    if (existingAdmin) {
      console.log("Admin already exists");
      process.exit(0);
    }

    // Create initial admin
    const admin = new Admin({
      username: "admin",
      email: "admin@zeniverse-ventures.com",
      password: "admin123", // This will be hashed by the pre-save hook
      name: "System Administrator",
      role: "superadmin",
    });

    await admin.save();
    console.log("Initial admin created successfully");
    console.log("Username: admin");
    console.log("Password: admin123");
    console.log("Please change the password after first login");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createInitialAdmin();
