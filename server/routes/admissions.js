import express from "express";
import {
  getPublicAdmissions,
  getAdmissionById,
} from "../controllers/adminAdmissionController.js";

const router = express.Router();

// Public routes for admissions
router.get("/", getPublicAdmissions);
router.get("/:id", getAdmissionById);

export default router;
