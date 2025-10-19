import express from "express";
import {
  submitApplication,
  getApplications,
} from "../controllers/admissionApplicationController.js";
import AdmissionApplication from "../models/AdmissionApplication.js"
import { admissionApplicationUpload } from "../config/cloudinary.js";
import { facultyUpload } from "../config/cloudinary.js";
import { authenticateAdmin } from "../middleware/auth.js";
const router = express.Router();

// Public route for students
router.post("/apply", admissionApplicationUpload.single("image"), submitApplication);

// Admin route
router.get("/applications", getApplications);
router.use(authenticateAdmin)
router.get("/applications/:id", async (req, res) => {
  try {
    const application = await AdmissionApplication.findById(req.params.id)
      .populate("admissionId")
      .lean();

    if (!application)
      return res.status(404).json({ success: false, message: "Application not found" });

    res.status(200).json({ success: true, data: application });
  } catch (error) {
    console.error("Error fetching single application:", error);
    res.status(500).json({ success: false, message: "Failed to fetch application" });
  }
});
/**
 * @route   DELETE /api/admin/applications/delete-all
 * @desc    Delete all admission applications (admin only)
 * @access  Private/Admin
 */
router.delete("/applications/delete-all", async (req, res) => {
  try {
    const result = await AdmissionApplication.deleteMany({});

    res.status(200).json({
      success: true,
      message: `All admission applications deleted successfully.`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete all admission applications.",
      error: error.message,
    });
  }
});
export default router;
 