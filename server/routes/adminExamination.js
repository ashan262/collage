import express from "express";
import { body } from "express-validator";
import {
  getExaminations,
  getPublicExaminations,
  createExamination,
  updateExamination,
  deleteExamination,
  getExaminationById,
  toggleFeatured,
  togglePublished,
  getExaminationStats,
} from "../controllers/adminExaminationController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Validation rules for examination
const examinationValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must not exceed 1000 characters"),
  body("type")
    .isIn([
      "schedule",
      "result",
      "rule",
      "admit-card",
      "appeal",
      "announcement",
    ])
    .withMessage("Invalid examination type"),
  body("examDate")
    .optional()
    .isISO8601()
    .withMessage("Exam date must be a valid date"),
  body("resultDate")
    .optional()
    .isISO8601()
    .withMessage("Result date must be a valid date"),
  body("lastDateToApply")
    .optional()
    .isISO8601()
    .withMessage("Last date to apply must be a valid date"),
  body("examCenter")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Exam center must not exceed 200 characters"),
  body("subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array"),
  body("eligibility")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Eligibility must not exceed 500 characters"),
  body("feeStructure.amount")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Fee amount must be a positive number"),
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
router.get("/public", getPublicExaminations);

// Admin routes (authentication required)
router.use(authenticate); // Apply authentication to all routes below

router.get("/", getExaminations);
router.get("/stats", getExaminationStats);
router.post("/", examinationValidation, createExamination);
router.get("/:id", getExaminationById);
router.put("/:id", examinationValidation, updateExamination);
router.delete("/:id", deleteExamination);
router.patch("/:id/toggle-featured", toggleFeatured);
router.patch("/:id/toggle-published", togglePublished);

export default router;
