import mongoose from "mongoose";
import dotenv from "dotenv";
import readline from "readline";
import Admin from "../models/Admin.js";

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const promptUser = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Check if any admin already exists
    const existingAdmin = await Admin.findOne({ role: "super-admin" });
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists:");
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);

      const overwrite = await promptUser(
        "Do you want to create another admin? (y/N): "
      );
      if (overwrite.toLowerCase() !== "y") {
        console.log("Admin creation cancelled.");
        rl.close();
        process.exit(0);
      }
    }

    console.log("\n🔧 Creating new admin user...");

    // Get admin details from user input
    const username =
      (await promptUser("Enter username (default: admin): ")) || "admin";
    const email =
      (await promptUser("Enter email (default: admin@fgdckohat.edu.pk): ")) ||
      "admin@fgdckohat.edu.pk";
    const fullName =
      (await promptUser("Enter full name (default: System Administrator): ")) ||
      "System Administrator";

    console.log(
      "\n⚠️  SECURITY WARNING: Please change the default password after first login!"
    );
    const password =
      (await promptUser("Enter password (default: admin123): ")) || "admin123";

    // Create admin user
    const admin = new Admin({
      username: username,
      email: email,
      password: password,
      fullName: fullName,
      role: "super-admin",
      permissions: {
        canManageNews: true,
        canManageGallery: true,
        canManageFaculty: true,
        canManageAdmissions: true,
        canManagePages: true,
        canManageContacts: true,
        canManageUsers: true,
      },
      createdAt: new Date(),
      isActive: true,
    });

    await admin.save();

    console.log("\n🎉 Admin user created successfully!");
    console.log("📋 Login Details:");
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: super-admin`);

    console.log("\n🔐 IMPORTANT SECURITY NOTES:");
    console.log(
      "   1. Change the default password immediately after first login"
    );
    console.log("   2. Access admin panel at: https://your-domain.com/admin");
    console.log("   3. Keep login credentials secure");
    console.log("   4. Enable 2FA if available in future updates");
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    if (error.code === 11000) {
      console.log(
        "   This username or email already exists. Please choose different credentials."
      );
    }
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log("✅ Database connection closed");
    process.exit(0);
  }
};

createAdmin();
