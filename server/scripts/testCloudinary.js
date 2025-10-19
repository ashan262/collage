import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Test Cloudinary configuration
const testCloudinary = async () => {
  try {
    console.log("Testing Cloudinary configuration...");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    console.log("API Key:", process.env.CLOUDINARY_API_KEY);
    console.log(
      "API Secret:",
      process.env.CLOUDINARY_API_SECRET ? "Set" : "Not set"
    );

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Test the connection by getting account details
    const result = await cloudinary.api.ping();
    console.log("✅ Cloudinary connection successful:", result);

    // Test upload folder access
    try {
      const folders = await cloudinary.api.root_folders();
      console.log("✅ Cloudinary folders accessible:", folders);
    } catch (folderError) {
      console.log(
        "ℹ️ Folder check (this is normal for new accounts):",
        folderError.message
      );
    }
  } catch (error) {
    console.error("❌ Cloudinary configuration error:", error);
    console.error("Error details:", {
      message: error.message,
      http_code: error.http_code,
    });
  }
};

testCloudinary();
