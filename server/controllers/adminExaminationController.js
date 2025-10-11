import Examination from "../models/Examination.js";
import { validationResult } from "express-validator";

// Get all examinations with pagination and filtering
const getExaminations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      class: className,
      status,
      isPublished,
      isFeatured,
      search,
      sortBy = "examDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (type && type !== "all") {
      filter.type = type;
    }

    if (className && className !== "all") {
      filter.class = className;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const examinations = await Examination.find(filter)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Examination.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        examinations,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalExaminations: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching examinations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch examinations",
      error: error.message,
    });
  }
};

// Get public examinations (for frontend)
const getPublicExaminations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      class: className,
      status,
      isFeatured,
    } = req.query;

    // Build filter object - only published examinations
    const filter = { isPublished: true };

    if (type && type !== "all") {
      filter.type = type;
    }

    if (className && className !== "all") {
      filter.class = className;
    }

    if (status && status !== "all") {
      filter.status = status;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query - sort by featured first, then by exam date
    const examinations = await Examination.find({})
      .sort({ isFeatured: -1, examDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-createdBy -lastModifiedBy -__v"); // Exclude admin fields

    // Get total count for pagination
    const total = await Examination.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        examinations,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalExaminations: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public examinations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch examinations",
      error: error.message,
    });
  }
};

// Get single examination by ID
const getExaminationById = async (req, res) => {
  try {
    const { _id } = req.params;

    const examination = await Examination.findById(_id)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email");

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.json({
      success: true,
      data: examination,
    });
  } catch (error) {
    console.error("Error fetching examination:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch examination",
      error: error.message,
    });
  }
};

// Create new examination
const createExamination = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const examinationData = {
      ...req.body,
      createdBy: req.admin.id,
    };

    const examination = new Examination(examinationData);
    await examination.save();

    // Populate the created examination
    await examination.populate("createdBy", "fullName email");

    res.status(201).json({
      success: true,
      message: "Examination created successfully",
      data: examination,
    });
  } catch (error) {
    console.error("Error creating examination:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create examination",
      error: error.message,
    });
  }
};

// Update examination
const updateExamination = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModifiedBy: req.admin.id,
    };

    const examination = await Examination.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email");

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.json({
      success: true,
      message: "Examination updated successfully",
      data: examination,
    });
  } catch (error) {
    console.error("Error updating examination:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update examination",
      error: error.message,
    });
  }
};

// Delete examination
const deleteExamination = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await Examination.findByIdAndDelete(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    res.json({
      success: true,
      message: "Examination deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting examination:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete examination",
      error: error.message,
    });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await Examination.findById(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    examination.isFeatured = !examination.isFeatured;
    examination.lastModifiedBy = req.admin.id;
    await examination.save();

    res.json({
      success: true,
      message: `Examination ${
        examination.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: { isFeatured: examination.isFeatured },
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update featured status",
      error: error.message,
    });
  }
};

// Toggle published status
const togglePublished = async (req, res) => {
  try {
    const { id } = req.params;

    const examination = await Examination.findById(id);

    if (!examination) {
      return res.status(404).json({
        success: false,
        message: "Examination not found",
      });
    }

    examination.isPublished = !examination.isPublished;
    examination.lastModifiedBy = req.admin.id;
    await examination.save();

    res.json({
      success: true,
      message: `Examination ${
        examination.isPublished ? "published" : "unpublished"
      } successfully`,
      data: { isPublished: examination.isPublished },
    });
  } catch (error) {
    console.error("Error toggling published status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update published status",
      error: error.message,
    });
  }
};

// Get examination statistics
const getExaminationStats = async (req, res) => {
  try {
    const stats = await Examination.aggregate([
      {
        $group: {
          _id: null,
          totalExaminations: { $sum: 1 },
          publishedExaminations: {
            $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] },
          },
          featuredExaminations: {
            $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] },
          },
          upcomingExams: {
            $sum: { $cond: [{ $eq: ["$status", "upcoming"] }, 1, 0] },
          },
          ongoingExams: {
            $sum: { $cond: [{ $eq: ["$status", "ongoing"] }, 1, 0] },
          },
          completedExams: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
    ]);

    const typeStats = await Examination.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const classStats = await Examination.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$class",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalExaminations: 0,
          publishedExaminations: 0,
          featuredExaminations: 0,
          upcomingExams: 0,
          ongoingExams: 0,
          completedExams: 0,
        },
        byType: typeStats,
        byClass: classStats,
      },
    });
  } catch (error) {
    console.error("Error fetching examination stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch examination statistics",
      error: error.message,
    });
  }
};

export {
  getExaminations,
  getPublicExaminations,
  getExaminationById,
  createExamination,
  updateExamination,
  deleteExamination,
  toggleFeatured,
  togglePublished,
  getExaminationStats,
};
