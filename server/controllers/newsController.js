import News from "../models/News.js";
import path from "path";
import fs from "fs";

// @desc    Get all news
// @route   GET /api/news
// @access  Public
export const getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const featured = req.query.featured;
    const search = req.query.search;

    // Build query
    let query = { status: "published" };

    if (category) {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const news = await News.find(query)
      .sort({ publishDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments(query);

    res.status(200).json({
      success: true,
      count: news.length,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      data: news,
    });
  } catch (error) {
    console.error("Get all news error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting news",
    });
  }
};

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
export const getNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news || news.status !== "published") {
      return res.status(404).json({
        success: false,
        message: "News not found",
      });
    }

    // Increment views
    news.views += 1;
    await news.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error("Get news error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting news",
    });
  }
};

// @desc    Serve news image
// @route   GET /api/news/image/:filename
// @access  Public
export const serveNewsImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(process.cwd(), "uploads", "news", filename);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Set CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );

    // Determine content type based on file extension
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg"; // default
    if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    } else if (ext === ".webp") {
      contentType = "image/webp";
    }

    // Set appropriate headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // 1 year cache

    // Send the file
    res.sendFile(imagePath);
  } catch (error) {
    console.error("Serve news image error:", error);
    res.status(500).json({
      success: false,
      message: "Error serving image",
    });
  }
};
