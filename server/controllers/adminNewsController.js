import News from "../models/News.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

// @desc    Get all news with admin details
// @route   GET /api/admin/news
// @access  Private (Admin)
const getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("author", "fullName");

    const total = await News.countDocuments(query);

    res.json({
      success: true,
      data: {
        news,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get all news error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get single news item
// @route   GET /api/admin/news/:id
// @access  Private (Admin)
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate(
      "author",
      "fullName"
    );

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News item not found",
      });
    }

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Get news by id error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Create new news item
// @route   POST /api/admin/news
// @access  Private (Admin)
const createNews = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featured, status } =
      req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required",
      });
    }

    const newsData = {
      title,
      content,
      excerpt: excerpt || content.substring(0, 200) + "...",
      category: category || "news",
      tags: tags || [],
      featured: featured || false,
      status: status || "published",
      author: req.admin.id,
      publishDate: status === "published" ? new Date() : null,
    };

    // Add images if uploaded
    if (req.files && req.files.length > 0) {
      newsData.images = req.files.map((file, index) => {
        // Extract public_id from Cloudinary URL for cleanup purposes
        const publicId = file.path.split("/").pop().split(".")[0];

        return {
          cloudinaryId: publicId,
          url: file.path, // Cloudinary URL
          thumbnailUrl: file.path.replace(
            "/upload/",
            "/upload/c_thumb,w_200,h_150/"
          ),
          alt: `${title || "News image"} - ${index + 1}`,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        };
      });

      // Maintain backward compatibility by setting first image as main image
      newsData.image = {
        url: newsData.images[0].url,
        alt: newsData.images[0].alt,
      };
    }

    const news = new News(newsData);
    await news.save();

    // Populate author info
    await news.populate("author", "fullName");

    res.status(201).json({
      success: true,
      message: "News created successfully",
      data: news,
    });
  } catch (error) {
    console.error("Create news error:", error);

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

// @desc    Update news item
// @route   PUT /api/admin/news/:id
// @access  Private (Admin)
const updateNews = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, featured, status } =
      req.body;

    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News item not found",
      });
    }

    // Update fields
    if (title) news.title = title;
    if (content) news.content = content;
    if (excerpt) news.excerpt = excerpt;
    if (category) news.category = category;
    if (tags) news.tags = tags;
    if (typeof featured !== "undefined") news.featured = featured;

    // Handle status change
    if (status && status !== news.status) {
      news.status = status;
      if (status === "published" && !news.publishDate) {
        news.publishDate = new Date();
      }
    }

    // Handle images update
    let finalImages = [];

    // First, add existing images that should be preserved
    if (req.body.existingImages) {
      try {
        const existingImages = JSON.parse(req.body.existingImages);
        finalImages = [...existingImages];
      } catch (error) {
        console.error("Error parsing existing images:", error);
      }
    }

    // Then, add new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file, index) => {
        // Extract public_id from Cloudinary URL for cleanup purposes
        const publicId = file.path.split("/").pop().split(".")[0];

        return {
          cloudinaryId: publicId,
          url: file.path, // Cloudinary URL
          thumbnailUrl: file.path.replace(
            "/upload/",
            "/upload/c_thumb,w_200,h_150/"
          ),
          alt: `${title || news.title} - ${finalImages.length + index + 1}`,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        };
      });

      finalImages = [...finalImages, ...newImages];
    }

    // Update images if we have any
    if (finalImages.length > 0) {
      news.images = finalImages;
      // Maintain backward compatibility by setting first image as main image
      news.image = {
        url: finalImages[0].url,
        alt: finalImages[0].alt,
      };
    }

    await news.save();
    await news.populate("author", "fullName");

    res.json({
      success: true,
      message: "News updated successfully",
      data: news,
    });
  } catch (error) {
    console.error("Update news error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete news item
// @route   DELETE /api/admin/news/:id
// @access  Private (Admin)
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News item not found",
      });
    }

    // Clean up image files from Cloudinary
    const deleteCloudinaryImage = async (image) => {
      try {
        if (image.cloudinaryId) {
          // Delete from Cloudinary using public_id
          await cloudinary.uploader.destroy(image.cloudinaryId);
        } else if (image.url && image.url.includes("cloudinary")) {
          // Extract public_id from URL if cloudinaryId is not available
          const publicId = image.url.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(publicId);
        } else if (image.url && !image.url.startsWith("http")) {
          // Handle legacy local files
          const filename = image.url.split("/").pop();
          const imagePath = path.join(
            process.cwd(),
            "uploads",
            "news",
            filename
          );
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      } catch (err) {
        console.error("Error deleting image:", err);
      }
    };

    // Delete all images in the images array
    if (news.images && news.images.length > 0) {
      for (const image of news.images) {
        await deleteCloudinaryImage(image);
      }
    }

    // Delete the single image for backward compatibility
    if (news.image && news.image.url) {
      await deleteCloudinaryImage(news.image);
    }

    await News.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "News deleted successfully",
    });
  } catch (error) {
    console.error("Delete news error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get news statistics
// @route   GET /api/admin/news/stats
// @access  Private (Admin)
const getNewsStats = async (req, res) => {
  try {
    const stats = await News.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryStats = await News.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalNews = await News.countDocuments();
    const featuredNews = await News.countDocuments({ featured: true });

    res.json({
      success: true,
      data: {
        statusStats: stats,
        categoryStats,
        totalNews,
        featuredNews,
      },
    });
  } catch (error) {
    console.error("Get news stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsStats,
};
