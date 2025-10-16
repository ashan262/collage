import express from "express";
import {
  getAllGallery,
  getGalleryImage,
} from "../controllers/galleryController.js";

const router = express.Router();

// Public routes
router.get("/", getAllGallery);
router.get("/:id", getGalleryImage);

export default router;
