import express from "express";
import { body } from "express-validator";
import {
  getAdmissions,
  getPublicAdmissions,
  createAdmission,
  updateAdmission,
  deleteAdmission,
  getAdmissionById,
} from "../controllers/adminAdmissionController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Validation rules for admission
const admissionValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage("Description must not exceed 3000 characters"),
  body("type")
    .isIn([
      "announcement",
      "merit-list",
      "policy",
      "schedule",
      "fee-structure",
      "requirement",
      "form",
    ])
    .withMessage("Invalid admission type"),
  body("program")
    .isIn(["HSSC", "BS", "Both"])
    .withMessage("Invalid program type"),
  body("academicYear")
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage("Academic year must be between 4 and 20 characters"),
  body("applicationStartDate")
    .optional()
    .isISO8601()
    .withMessage("Application start date must be a valid date"),
  body("applicationEndDate")
    .optional()
    .isISO8601()
    .withMessage("Application end date must be a valid date"),
  body("eligibility")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Eligibility must not exceed 1000 characters"),
  body("feeStructure.amount")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Fee amount must be a positive number"),
  body("seats")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Seats must be a positive integer"),
  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("Published status must be boolean"),
  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("Featured status must be boolean"),
];

// Public routes (no authentication)
router.get("/public", getPublicAdmissions);

// Admin routes (authentication required)
router.use(authenticate); // Apply authentication to all routes below

router.get("/", getAdmissions);
router.post("/", admissionValidation, createAdmission);
router.get("/:id", getAdmissionById);
router.put("/:id", admissionValidation, updateAdmission);
router.delete("/:id", deleteAdmission);

export default router;
