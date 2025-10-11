import express from "express";
const router = express.Router();
import { authenticateAdmin } from "../middleware/auth.js";
import {
  login,
  getProfile,
  changePassword,
  refreshToken,
} from "../controllers/adminAuthController.js";

// Public routes
router.post("/login", login);

// Protected routes
router.use(authenticateAdmin);
router.get("/profile", getProfile);
router.put("/change-password", changePassword);
router.post("/refresh", refreshToken);

export default router;
