import express from "express";
const router = express.Router();
import { authenticateAdmin } from "../middleware/auth.js";
import { newsUpload } from "../config/cloudinary.js";
import {
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  getNewsStats,
} from "../controllers/adminNewsController.js";

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// News routes
router.get("/stats", getNewsStats);
router.get("/", getAllNews);
router.get("/:id", getNewsById);
router.post("/", newsUpload.array("images", 5), createNews);
router.put("/:id", newsUpload.array("images", 5), updateNews);
router.delete("/:id", deleteNews);

export default router;
