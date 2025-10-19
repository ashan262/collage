import express from "express";
import {
  getPublicActivities,
  getActivityById,
} from "../controllers/adminActivityController.js";

const router = express.Router();

// Public routes for activities
router.get("/", getPublicActivities);
router.get("/:id", getActivityById);

export default router;
