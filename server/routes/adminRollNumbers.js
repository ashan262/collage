import express from "express";
const router = express.Router();
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAdminRollNumbers,
  createRollNumber,
  updateRollNumber,
  deleteRollNumber,
  toggleRollNumberStatus,
  getRollNumberStats,
  getRollNumbers,
  incrementDownloadCount,
} from "../controllers/rollNumberController.js";
import { authenticate } from "../middleware/auth.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads/roll-numbers");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow PDF and Excel files
  const allowedTypes = [
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, Excel, and CSV files are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// File upload endpoint
router.post("/upload", authenticate, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const fileUrl = `/uploads/roll-numbers/${req.file.filename}`;

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload file",
      error: error.message,
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 10MB.",
      });
    }
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

// Public routes
router.get("/", getRollNumbers);
router.post("/download/:id", incrementDownloadCount);

// Admin routes (protected)
router.get("/admin", authenticate, getAdminRollNumbers);
router.get("/admin/stats", authenticate, getRollNumberStats);
router.post("/admin", authenticate, createRollNumber);
router.put("/admin/:id", authenticate, updateRollNumber);
router.delete("/admin/:id", authenticate, deleteRollNumber);
router.patch("/admin/:id/toggle", authenticate, toggleRollNumberStatus);

export default router;
