import express from "express";
const router = express.Router();
import { authenticateAdmin } from "../middleware/auth.js";
import { facultyUpload } from "../config/cloudinary.js";
import {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyStats,
} from "../controllers/adminFacultyController.js";

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// Faculty routes
router.get("/stats", getFacultyStats);
router.get("/", getAllFaculty);
router.get("/:id", getFacultyById);
router.post("/", facultyUpload.single("image"), createFaculty);
router.put("/:id", facultyUpload.single("image"), updateFaculty);
router.delete("/:id", deleteFaculty);

export default router;
