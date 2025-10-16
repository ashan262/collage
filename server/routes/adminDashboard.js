import express from "express";
const router = express.Router();
import { authenticateAdmin } from "../middleware/auth.js";
import {
  getDashboardStats,
  getRecentActivities,
} from "../controllers/adminDashboardController.js";

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// Dashboard routes
router.get("/stats", getDashboardStats);
router.get("/activities", getRecentActivities);

export default router;
