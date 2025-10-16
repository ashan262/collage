import express from "express";
const router = express.Router();
import {
  getAllFaculty,
  getFacultyByDepartment,
  getFacultyById,
  getFacultyImage,
} from "../controllers/facultyController.js";

// Public faculty routes
router.get("/", getAllFaculty);
router.get("/department/:department", getFacultyByDepartment);
router.get("/image/:filename", getFacultyImage);
router.get("/:id", getFacultyById);

export default router;
