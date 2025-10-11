import Activity from "../models/Activity.js";
import { validationResult } from "express-validator";

// Get all activities with pagination and filtering
const getActivities = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      department,
      status,
      isPublished,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (type && type !== "all") filter.type = type;
    if (department && department !== "all") filter.department = department;
    if (status && status !== "all") filter.status = status;
    if (isPublished !== undefined) filter.isPublished = isPublished === "true";

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const activities = await Activity.find(filter)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Activity.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalActivities: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};

// Get public activities (for frontend)
const getPublicActivities = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, department } = req.query;

    const filter = { isPublished: true };

    if (type && type !== "all") filter.type = type;
    if (department && department !== "all") filter.department = department;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const activities = await Activity.find(filter)
      .sort({ isFeatured: -1, startDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-createdBy -lastModifiedBy -__v");

    const total = await Activity.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalActivities: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public activities:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
      error: error.message,
    });
  }
};

// Create new activity
const createActivity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const activity = new Activity({
      ...req.body,
      createdBy: req.admin.id,
    });
    await activity.save();
    await activity.populate("createdBy", "fullName email");

    res.status(201).json({
      success: true,
      message: "Activity created successfully",
      data: activity,
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create activity",
      error: error.message,
    });
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByIdAndUpdate(
      id,
      { ...req.body, lastModifiedBy: req.admin.id },
      { new: true, runValidators: true }
    ).populate("createdBy lastModifiedBy", "fullName email");

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.json({
      success: true,
      message: "Activity updated successfully",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update activity",
      error: error.message,
    });
  }
};

// Delete activity
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findByIdAndDelete(id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete activity",
      error: error.message,
    });
  }
};

// Get activity by ID
const getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email");

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch activity",
      error: error.message,
    });
  }
};

export {
  getActivities,
  getPublicActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
};
