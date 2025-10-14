import express from "express";
import {
  getAllNews,
  getNews,
  serveNewsImage,
} from "../controllers/newsController.js";

const router = express.Router();

// Public routes
router.get("/", getAllNews);
router.get("/image/:filename", serveNewsImage);
router.get("/:id", getNews);

export default router;
