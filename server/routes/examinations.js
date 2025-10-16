import express from "express";
import {
  getPublicExaminations,
  getExaminationById,
} from "../controllers/adminExaminationController.js";

const router = express.Router();

// Public routes for examinations
router.get("/", getPublicExaminations);
router.get("/:id", getExaminationById);

export default router;
