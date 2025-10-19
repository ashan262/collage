import Gallery from "../models/Gallery.js";
import path from "path";
import fs from "fs";

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Public
export const getAllGallery = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category;

    // Build query
    let query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const images = await Gallery.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Gallery.countDocuments(query);

    // Transform data to include full URL
    const transformedImages = images.map((image) => ({
      ...image.toObject(),
      imageUrl: `/uploads/gallery/${image.image.filename}`,
    }));

    res.status(200).json({
      success: true,
      count: images.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: transformedImages,
    });
  } catch (error) {
    console.error("Get all gallery error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting gallery images",
    });
  }
};

// @desc    Get single gallery image
// @route   GET /api/gallery/:id
// @access  Public
export const getGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image || !image.isActive) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Transform data to include full URL
    const transformedImage = {
      ...image.toObject(),
      imageUrl: `/uploads/gallery/${image.image.filename}`,
    };

    res.status(200).json({
      success: true,
      data: transformedImage,
    });
  } catch (error) {
    console.error("Get gallery image error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting image",
    });
  }
};
