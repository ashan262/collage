import Admission from "../models/Admission.js";
import { validationResult } from "express-validator";

// Get all admissions with pagination and filtering
const getAdmissions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      program,
      academicYear,
      status,
      isPublished,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = {};

    if (type && type !== "all") filter.type = type;
    if (program && program !== "all") filter.program = program;
    if (academicYear) filter.academicYear = academicYear;
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

    const admissions = await Admission.find(filter)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Admission.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        admissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAdmissions: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admissions",
      error: error.message,
    });
  }
};

// Get public admissions (for frontend)
const getPublicAdmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, program, academicYear } = req.query;

    const filter = { isPublished: true };

    if (type && type !== "all") filter.type = type;
    if (program && program !== "all") filter.program = program;
    if (academicYear) filter.academicYear = academicYear;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const admissions = await Admission.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-createdBy -lastModifiedBy -__v");

    const total = await Admission.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        admissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAdmissions: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public admissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admissions",
      error: error.message,
    });
  }
};

// Create, update, delete and other CRUD operations (abbreviated for brevity)
const createAdmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const admission = new Admission({
      ...req.body,
      createdBy: req.admin.id,
    });
    await admission.save();
    await admission.populate("createdBy", "fullName email");

    res.status(201).json({
      success: true,
      message: "Admission created successfully",
      data: admission,
    });
  } catch (error) {
    console.error("Error creating admission:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create admission",
      error: error.message,
    });
  }
};

const updateAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await Admission.findByIdAndUpdate(
      id,
      { ...req.body, lastModifiedBy: req.admin.id },
      { new: true, runValidators: true }
    ).populate("createdBy lastModifiedBy", "fullName email");

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    res.json({
      success: true,
      message: "Admission updated successfully",
      data: admission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update admission",
      error: error.message,
    });
  }
};

const deleteAdmission = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await Admission.findByIdAndDelete(id);

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    res.json({
      success: true,
      message: "Admission deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete admission",
      error: error.message,
    });
  }
};

const getAdmissionById = async (req, res) => {
  try {
    const { id } = req.params;
    const admission = await Admission.findById(id)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email");

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "Admission not found",
      });
    }

    res.json({
      success: true,
      data: admission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch admission",
      error: error.message,
    });
  }
};

export {
  getAdmissions,
  getPublicAdmissions,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  getAdmissionById,
};
