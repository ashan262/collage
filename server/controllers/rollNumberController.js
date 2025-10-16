import RollNumber from "../models/RollNumber.js";
import path from "path";
import { promises as fs } from "fs";

// Get all roll numbers (public endpoint)
const getRollNumbers = async (req, res) => {
  try {
    const { program, session, academicYear, search } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (program) filter.program = program;
    if (session) filter.session = { $regex: session, $options: "i" };
    if (academicYear) filter.academicYear = academicYear;

    // Build search query
    let query = RollNumber.find(filter);

    if (search) {
      query = query.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { session: { $regex: search, $options: "i" } },
        ],
      });
    }

    const rollNumbers = await query
      .select("name session program color fileUrl academicYear")
      .sort({ academicYear: -1, program: 1, name: 1 });

    res.json({
      success: true,
      data: rollNumbers,
      count: rollNumbers.length,
    });
  } catch (error) {
    console.error("Error fetching roll numbers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roll numbers",
      error: error.message,
    });
  }
};

// Get all roll numbers for admin
const getAdminRollNumbers = async (req, res) => {
  try {
    const {
      program,
      session,
      academicYear,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filter object
    const filter = {};

    if (program) filter.program = program;
    if (session) filter.session = { $regex: session, $options: "i" };
    if (academicYear) filter.academicYear = academicYear;

    // Build search query
    let query = RollNumber.find(filter);

    if (search) {
      query = query.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { session: { $regex: search, $options: "i" } },
          { academicYear: { $regex: search, $options: "i" } },
        ],
      });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await RollNumber.countDocuments(query.getFilter());

    const rollNumbers = await query
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: rollNumbers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNext: skip + rollNumbers.length < total,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching admin roll numbers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roll numbers",
      error: error.message,
    });
  }
};

// Create new roll number entry
const createRollNumber = async (req, res) => {
  try {
    const {
      name,
      session,
      program,
      color = "blue",
      fileUrl,
      fileName,
      fileSize,
      academicYear = "2025-26",
      isActive = true,
      metadata,
    } = req.body;

    // Validate required fields
    if (!name || !session || !program) {
      return res.status(400).json({
        success: false,
        message: "Name, session, and program are required",
      });
    }

    // Check for duplicate
    const existingRollNumber = await RollNumber.findOne({
      name: name.trim(),
      session: session.trim(),
      academicYear,
    });

    if (existingRollNumber) {
      return res.status(400).json({
        success: false,
        message: "Roll number entry with this name and session already exists",
      });
    }

    const rollNumber = new RollNumber({
      name: name.trim(),
      session: session.trim(),
      program,
      color,
      fileUrl,
      fileName,
      fileSize,
      academicYear,
      isActive,
      uploadedBy: req.admin._id,
      metadata,
    });

    await rollNumber.save();

    // Populate uploadedBy field for response
    await rollNumber.populate("uploadedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Roll number entry created successfully",
      data: rollNumber,
    });
  } catch (error) {
    console.error("Error creating roll number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create roll number entry",
      error: error.message,
    });
  }
};

// Update roll number entry
const updateRollNumber = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.uploadedBy;
    delete updateData.downloadCount;
    delete updateData._id;

    const rollNumber = await RollNumber.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate("uploadedBy", "name email");

    if (!rollNumber) {
      return res.status(404).json({
        success: false,
        message: "Roll number entry not found",
      });
    }

    res.json({
      success: true,
      message: "Roll number entry updated successfully",
      data: rollNumber,
    });
  } catch (error) {
    console.error("Error updating roll number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update roll number entry",
      error: error.message,
    });
  }
};

// Delete roll number entry
const deleteRollNumber = async (req, res) => {
  try {
    const { id } = req.params;

    const rollNumber = await RollNumber.findById(id);
    if (!rollNumber) {
      return res.status(404).json({
        success: false,
        message: "Roll number entry not found",
      });
    }

    // Delete associated file if exists
    if (rollNumber.fileUrl) {
      try {
        const filePath = path.join(
          __dirname,
          "../uploads",
          rollNumber.fileUrl.replace("/uploads/", "")
        );
        await fs.unlink(filePath);
      } catch (fileError) {
        // File deletion error (file may not exist) - silent fail in production
        if (process.env.NODE_ENV === "development") {
          console.log("File deletion error:", fileError.message);
        }
      }
    }

    await RollNumber.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Roll number entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting roll number:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete roll number entry",
      error: error.message,
    });
  }
};

// Toggle roll number status
const toggleRollNumberStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const rollNumber = await RollNumber.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).populate("uploadedBy", "name email");

    if (!rollNumber) {
      return res.status(404).json({
        success: false,
        message: "Roll number entry not found",
      });
    }

    res.json({
      success: true,
      message: `Roll number entry ${
        isActive ? "activated" : "deactivated"
      } successfully`,
      data: rollNumber,
    });
  } catch (error) {
    console.error("Error toggling roll number status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update roll number status",
      error: error.message,
    });
  }
};

// Increment download count
const incrementDownloadCount = async (req, res) => {
  try {
    const { id } = req.params;

    const rollNumber = await RollNumber.findByIdAndUpdate(
      id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    if (!rollNumber) {
      return res.status(404).json({
        success: false,
        message: "Roll number entry not found",
      });
    }

    res.json({
      success: true,
      message: "Download count updated",
      data: { downloadCount: rollNumber.downloadCount },
    });
  } catch (error) {
    console.error("Error updating download count:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update download count",
      error: error.message,
    });
  }
};

// Get roll number statistics
const getRollNumberStats = async (req, res) => {
  try {
    const totalRollNumbers = await RollNumber.countDocuments();
    const activeRollNumbers = await RollNumber.countDocuments({
      isActive: true,
    });
    const hsscCount = await RollNumber.countDocuments({
      program: "HSSC",
      isActive: true,
    });
    const bsCount = await RollNumber.countDocuments({
      program: "BS",
      isActive: true,
    });

    const totalDownloads = await RollNumber.aggregate([
      { $group: { _id: null, total: { $sum: "$downloadCount" } } },
    ]);

    const recentUploads = await RollNumber.find()
      .populate("uploadedBy", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name academicYear createdAt uploadedBy");

    res.json({
      success: true,
      data: {
        totalRollNumbers,
        activeRollNumbers,
        inactiveRollNumbers: totalRollNumbers - activeRollNumbers,
        hsscCount,
        bsCount,
        totalDownloads: totalDownloads[0]?.total || 0,
        recentUploads,
      },
    });
  } catch (error) {
    console.error("Error fetching roll number stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch roll number statistics",
      error: error.message,
    });
  }
};

export {
  getRollNumbers,
  getAdminRollNumbers,
  createRollNumber,
  updateRollNumber,
  deleteRollNumber,
  toggleRollNumberStatus,
  incrementDownloadCount,
  getRollNumberStats,
};
