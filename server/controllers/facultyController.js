import Faculty from "../models/Faculty.js";
import path from "path";
import fs from "fs";

// @desc    Get all active faculty for public display
// @route   GET /api/faculty
// @access  Public
const getAllFaculty = async (req, res) => {
  try {
    const { department, search } = req.query;

    // const query = { status: "active" };
    const query = {}; // 

    if (department && department !== "all") {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
        { subjects: { $elemMatch: { $regex: search, $options: "i" } } },
      ];
    }

    const faculty = await Faculty.find(query)
      .sort({ displayOrder: 1, createdAt: 1 })
      .select("-createdAt -updatedAt -__v");

    res.json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    console.error("Get faculty error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting faculty",
    });
  }
};

// @desc    Get faculty by department
// @route   GET /api/faculty/department/:department
// @access  Public
const getFacultyByDepartment = async (req, res) => {
  try {
    const { department } = req.params;

    const faculty = await Faculty.find({
      department: department,
      status: "active",
    })
      .sort({ displayOrder: 1, createdAt: 1 })
      .select("-createdAt -updatedAt -__v");

    res.json({
      success: true,
      count: faculty.length,
      data: faculty,
    });
  } catch (error) {
    console.error("Get faculty by department error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting faculty",
    });
  }
};

// @desc    Get single faculty member
// @route   GET /api/faculty/:id
// @access  Public
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findOne({
      _id: req.params.id,
      status: "active",
    }).select("-createdAt -updatedAt -__v");

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    res.json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error("Get faculty by id error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting faculty",
    });
  }
};

// @desc    Serve faculty image
// @route   GET /api/faculty/image/:filename
// @access  Public
const getFacultyImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const imagePath = path.join(process.cwd(), "uploads", "faculty", filename);

    // Set CORS headers explicitly for all origins
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    // Get file stats to determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = "image/jpeg"; // default

    switch (ext) {
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".jpg":
      case ".jpeg":
      default:
        contentType = "image/jpeg";
        break;
    }

    // Set appropriate headers
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000"); // Cache for 1 year

    // Stream the file
    const fileStream = fs.createReadStream(imagePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Get faculty image error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting image",
    });
  }
};

export {
  getAllFaculty,
  getFacultyByDepartment,
  getFacultyById,
  getFacultyImage,
};
