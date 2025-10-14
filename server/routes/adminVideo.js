import express from "express";
import { body } from "express-validator";
import {
  getVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  bulkDeleteVideos,
  toggleFeatured,
  togglePublished,
  getVideoStats,
} from "../controllers/adminVideoController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Validation rules for video creation/update
const videoValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage("Title must be between 3 and 200 characters"),

  body("description")
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage("Description must be between 10 and 1000 characters"),

  body("videoUrl")
    .trim()
    .isURL()
    .withMessage("Please provide a valid video URL"),

  body("category")
    .isIn([
      "Campus Life",
      "Academics",
      "Student Life",
      "Sports",
      "Events",
      "Facilities",
      "Announcements",
      "Other",
    ])
    .withMessage("Please select a valid category"),

  body("platform")
    .optional()
    .isIn(["youtube", "vimeo", "direct", "other"])
    .withMessage("Please select a valid platform"),

  body("duration")
    .trim()
    .matches(/^(\d{1,2}:)?[0-5]?\d:[0-5]\d$/)
    .withMessage("Duration must be in format MM:SS or HH:MM:SS"),

  body("views")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Views format is too long"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Each tag must be 50 characters or less"),

  body("isPublished")
    .optional()
    .isBoolean()
    .withMessage("isPublished must be a boolean"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be a boolean"),

  body("thumbnailUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Thumbnail URL must be valid"),

  body("metadata.originalUploadDate")
    .optional()
    .isISO8601()
    .withMessage("Original upload date must be a valid date"),

  body("metadata.channelName")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Channel name must be 100 characters or less"),

  body("metadata.channelUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Channel URL must be valid"),

  body("metadata.quality")
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage("Quality must be 20 characters or less"),
];

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// GET /api/admin/videos - Get all videos with pagination and filtering
router.get("/", getVideos);

// GET /api/admin/videos/stats - Get video statistics
router.get("/stats", getVideoStats);

// GET /api/admin/videos/:id - Get single video by ID
router.get("/:id", getVideoById);

// POST /api/admin/videos - Create new video
router.post("/", videoValidation, createVideo);

// PUT /api/admin/videos/:id - Update video
router.put("/:id", videoValidation, updateVideo);

// DELETE /api/admin/videos/:id - Delete single video
router.delete("/:id", deleteVideo);

// POST /api/admin/videos/bulk-delete - Bulk delete videos
router.post(
  "/bulk-delete",
  body("ids")
    .isArray({ min: 1 })
    .withMessage("Please provide an array of video IDs"),
  body("ids.*").isMongoId().withMessage("Invalid video ID format"),
  bulkDeleteVideos
);

// PATCH /api/admin/videos/:id/toggle-featured - Toggle featured status
router.patch("/:id/toggle-featured", toggleFeatured);

// PATCH /api/admin/videos/:id/toggle-published - Toggle published status
router.patch("/:id/toggle-published", togglePublished);

export default router;
