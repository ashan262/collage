import Gallery from "../models/Gallery.js";
import {
  deleteFromCloudinary,
  getPublicIdFromUrl,
} from "../config/cloudinary.js";

// @desc    Get all gallery items
// @route   GET /api/admin/gallery
// @access  Private (Admin)
const getAllGallery = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const gallery = await Gallery.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Gallery.countDocuments(query);

    // Transform gallery items to include proper image URLs
    const transformedGallery = gallery.map((item) => ({
      ...item.toObject(),
      imageUrl:
        item.image.url ||
        `http://localhost:5000/uploads/gallery/${item.image.filename}`, // Fallback for legacy images
      thumbnailUrl:
        item.image.thumbnailUrl ||
        item.image.url ||
        `http://localhost:5000/uploads/gallery/${item.image.filename}`,
    }));

    res.json({
      success: true,
      data: {
        gallery: transformedGallery,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get all gallery error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Create new gallery item
// @route   POST /api/admin/gallery
// @access  Private (Admin)
const createGallery = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    // Extract public_id from Cloudinary URL if not provided
    let publicId = req.file.public_id;
    if (
      !publicId &&
      req.file.path &&
      req.file.path.includes("cloudinary.com")
    ) {
      // Extract public_id from URL: /v1234567890/folder/filename
      const matches = req.file.path.match(
        /\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)/i
      );
      publicId = matches ? matches[1] : req.file.filename;
    }

    const galleryData = {
      title: title || "Untitled",
      description: description || "",
      category: category || "campus",
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      image: {
        cloudinaryId: publicId,
        url: req.file.path,
        thumbnailUrl: req.file.path.replace(
          "/upload/",
          "/upload/w_400,h_300,c_fill,f_auto,q_auto/"
        ),
        originalName: req.file.originalname,
        size: req.file.bytes || req.file.size,
        mimetype: req.file.mimetype,
        // Keep legacy fields for compatibility
        filename: req.file.filename || publicId,
        path: req.file.path,
      },
    };

    const gallery = new Gallery(galleryData);
    const savedGallery = await gallery.save();

    res.status(201).json({
      success: true,
      message: "Gallery item created successfully",
      data: savedGallery,
    });
  } catch (error) {
    console.error("❌ Create gallery error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// @desc    Update gallery item
// @route   PUT /api/admin/gallery/:id
// @access  Private (Admin)
const updateGallery = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    // Update fields
    if (title) gallery.title = title;
    if (description) gallery.description = description;
    if (category) gallery.category = category;
    if (tags) gallery.tags = tags.split(",").map((tag) => tag.trim());

    // Update image if new file uploaded
    if (req.file) {
      // Delete old image from Cloudinary if it exists
      if (gallery.image.cloudinaryId) {
        try {
          await deleteFromCloudinary(gallery.image.cloudinaryId);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
        }
      }

      gallery.image = {
        cloudinaryId: req.file.public_id,
        url: req.file.path,
        thumbnailUrl: req.file.path.replace(
          "/upload/",
          "/upload/w_400,h_300,c_fill,f_auto,q_auto/"
        ),
        originalName: req.file.originalname,
        size: req.file.bytes || req.file.size,
        mimetype: req.file.mimetype,
        // Keep legacy fields for compatibility
        filename: req.file.filename || req.file.public_id,
        path: req.file.path,
      };
    }

    await gallery.save();

    res.json({
      success: true,
      message: "Gallery item updated successfully",
      data: gallery,
    });
  } catch (error) {
    console.error("Update gallery error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete gallery item
// @route   DELETE /api/admin/gallery/:id
// @access  Private (Admin)
const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);

    if (!gallery) {
      return res.status(404).json({
        success: false,
        message: "Gallery item not found",
      });
    }

    // Delete image from Cloudinary if it exists
    if (gallery.image.cloudinaryId) {
      try {
        await deleteFromCloudinary(gallery.image.cloudinaryId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await Gallery.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Gallery item deleted successfully",
    });
  } catch (error) {
    console.error("Delete gallery error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getAllGallery, createGallery, updateGallery, deleteGallery };
