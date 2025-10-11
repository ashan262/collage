import express from "express";
const router = express.Router();
import { authenticateAdmin } from "../middleware/auth.js";
import {
  galleryUpload,
  activityUpload,
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../config/cloudinary.js";
import {
  getAllGallery,
  createGallery,
  updateGallery,
  deleteGallery,
} from "../controllers/adminGalleryController.js";

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// Gallery routes
router.get("/", getAllGallery);
router.post("/", galleryUpload.single("image"), createGallery);
router.put("/:id", galleryUpload.single("image"), updateGallery);
router.delete("/:id", deleteGallery);

// Upload endpoint for activity images (just upload, don't create gallery entry)
router.post("/upload", activityUpload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Create thumbnail URL with Cloudinary transformations
    const thumbnailUrl = req.file.path.replace(
      "/upload/",
      "/upload/w_400,h_300,c_fill,f_auto,q_auto/"
    );

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        imageUrl: req.file.path,
        thumbnailUrl: thumbnailUrl,
        cloudinaryId: req.file.public_id,
        originalName: req.file.originalname,
        size: req.file.bytes,
      },
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
});

export default router;
