import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import models
import Admin from "../models/Admin.js";

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/collegewebsite"
    );
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

// Seed admin users
const seedAdmins = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: "admin" });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Create default admin user
    const adminData = {
      username: "admin",
      email: "admin@fgckohat.edu.pk",
      password: "admin123456", // Will be hashed by the model
      fullName: "System Administrator",
      role: "super-admin",
      isActive: true,
      permissions: {
        canManageNews: true,
        canManageGallery: true,
        canManageFaculty: true,
        canManageAdmissions: true,
        canManagePages: true,
        canManageContacts: true,
        canManageUsers: true,
      },
    };

    const admin = new Admin(adminData);
    await admin.save();

    console.log("✅ Admin user created successfully");
    console.log("📧 Username: admin");
    console.log("🔑 Password: admin123456");
    console.log("⚠️  Please change the password after first login!");

    // Create content manager user
    const contentManagerData = {
      username: "content-manager",
      email: "content@fgckohat.edu.pk",
      password: "content123456",
      fullName: "Content Manager",
      role: "content-manager",
      isActive: true,
      permissions: {
        canManageNews: true,
        canManageGallery: true,
        canManageFaculty: true,
        canManageAdmissions: true,
        canManagePages: true,
        canManageContacts: true,
        canManageUsers: false,
      },
    };

    const contentManager = new Admin(contentManagerData);
    await contentManager.save();

    console.log("✅ Content Manager user created successfully");
    console.log("📧 Username: content-manager");
    console.log("🔑 Password: content123456");
  } catch (error) {
    console.error("❌ Error seeding admin users:", error);
  }
};

// Run the seeding
const runSeed = async () => {
  try {
    await connectDB();
    await seedAdmins();

    console.log("\n🎉 Admin seeding completed!");
    console.log("\n📋 Admin Panel Access:");
    console.log("   URL: http://localhost:3000/admin");
    console.log("   API: http://localhost:5000/api/admin");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

runSeed();
