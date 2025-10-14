import express from "express";
import { getPublicVideos } from "../controllers/adminVideoController.js";

const router = express.Router();

// GET /api/videos - Get published videos (public endpoint)
router.get("/", getPublicVideos);

export default router;
