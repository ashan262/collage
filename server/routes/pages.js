import express from "express";
import { getPageContent } from "../controllers/pageController.js";

const router = express.Router();

// Public routes
router.get("/:pageId", getPageContent);

export default router;
