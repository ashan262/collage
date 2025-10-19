import express from "express";
import Alumni from "../models/Alumni.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Get all alumni registrations
router.get("/registrations", async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    const registrations = await Alumni.find(filter)
      .sort({ registrationDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Alumni.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalRegistrations: total
      }
    });
  } catch (error) {
    console.error("Error fetching alumni registrations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni registrations",
      error: error.message
    });
  }
});
// Add this temporary route to your alumni router
router.get("/admin/test", (req, res) => {
  res.json({ message: "Alumni admin route is working!" });
});

// Add other admin routes here (get by id, update, delete, etc.)
// // Update alumni registration status
router.patch("/registrations/:id", async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (pending, approved, rejected)"
      });
    }

    const updateData = { status };
    if (remarks) {
      updateData.remarks = remarks;
    }
    if (status === "approved" || status === "rejected") {
      updateData.reviewedBy = req.admin._id;
      updateData.reviewedAt = new Date();
    }

    const registration = await Alumni.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Alumni registration not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Alumni registration ${status} successfully`,
      data: registration
    });
  } catch (error) {
    console.error("Error updating alumni registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update alumni registration",
      error: error.message
    });
  }
});

// Delete single alumni registration
router.delete("/registrations/:id", async (req, res) => {
  try {
    const registration = await Alumni.findByIdAndDelete(req.params.id);

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: "Alumni registration not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Alumni registration deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting alumni registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete alumni registration",
      error: error.message
    });
  }
});


export default router;