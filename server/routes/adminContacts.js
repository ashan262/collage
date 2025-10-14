import express from "express";
const router = express.Router();
import { authenticateAdmin } from "../middleware/auth.js";
import {
  getAllContacts,
  getContactById,
  updateContact,
  deleteContact,
} from "../controllers/adminContactController.js";

// Apply authentication middleware to all routes
router.use(authenticateAdmin);

// Contact routes
router.get("/", getAllContacts);
router.get("/:id", getContactById);
router.put("/:id", updateContact);
router.delete("/:id", deleteContact);

export default router;
