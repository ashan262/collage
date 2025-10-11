import express from "express";
import { body } from "express-validator";
import {
  getActivities,
  getPublicActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityById,
} from "../controllers/adminActivityController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Validation rules for activity
const activityValidation = [
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
      "event",
      "photo-gallery",
      "achievement",
      "announcement",
      "competition",
      "workshop",
    ])
    .withMessage("Invalid activity type"),
  body("category")
    .optional()
    .isIn([
      "Sports",
      "Academic",
      "Cultural",
      "Social",
      "Alumni",
      "Co-Curricular",
      "Other",
    ])
    .withMessage("Invalid activity category"),
  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),
  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),
  body("venue")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Venue must not exceed 200 characters"),
  body("organizer")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Organizer must not exceed 100 characters"),
  body("contactInfo.phone")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid phone number"),
  body("contactInfo.email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),
  body("maxParticipants")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Max participants must be a positive integer"),
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
router.get("/public", getPublicActivities);

// Admin routes (authentication required)
router.use(authenticate); // Apply authentication to all routes below

router.get("/", getActivities);
router.post("/", activityValidation, createActivity);
router.get("/:id", getActivityById);
router.put("/:id", activityValidation, updateActivity);
router.delete("/:id", deleteActivity);

export default router;
