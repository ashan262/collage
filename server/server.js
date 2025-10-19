import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";

// Import routes
import newsRoutes from "./routes/news.js";
import galleryRoutes from "./routes/gallery.js";
import contactRoutes from "./routes/contact.js";
import pageRoutes from "./routes/pages.js";
import facultyRoutes from "./routes/faculty.js";
import videoRoutes from "./routes/videos.js";
import examinationRoutes from "./routes/examinations.js";
import admissionRoutes from "./routes/admissions.js";
import alumniRoutes from "./routes/alumni.js";
import activityRoutes from "./routes/activities.js";

// Import admin routes
import adminAuthRoutes from "./routes/adminAuth.js";
import adminNewsRoutes from "./routes/adminNews.js";
import adminGalleryRoutes from "./routes/adminGallery.js";
import adminVideoRoutes from "./routes/adminVideo.js";
import adminDashboardRoutes from "./routes/adminDashboard.js";
import adminContactRoutes from "./routes/adminContacts.js";
import adminFacultyRoutes from "./routes/adminFaculty.js";
import adminExaminationRoutes from "./routes/adminExamination.js";
import adminAdmissionRoutes from "./routes/adminAdmission.js";
import adminActivityRoutes from "./routes/adminActivity.js";
import adminRollNumbersRoutes from "./routes/adminRollNumbers.js";
import admissionApplicationRoutes from "./routes/admissionApplicationRoutes.js"; // new for addmisson
import adminAlumniRoute from "./routes/adminAlumni.js";
// Load environment variables
dotenv.config();
 
// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(
  cors({
    origin: [
      "https://fgdcbkohat.edu.pk",
      "https://www.fgdcbkohat.edu.pk",
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    optionsSuccessStatus: 200,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files with CORS headers
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.header("Cross-Origin-Resource-Policy", "cross-origin");

    // Handle preflight
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// API routes
app.use(
  "/api/news",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  },
  newsRoutes
);
app.use(
  "/api/gallery",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
  },
  galleryRoutes
);
app.use("/api/contact", contactRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/videos", videoRoutes);
// app.use("/api/examinations", adminExaminationRoutes);
app.use("/api/examinations", examinationRoutes);
app.use("/api/admissions-application", admissionApplicationRoutes);
app.use("/api/admissions", admissionRoutes);

app.use("/api/activities", activityRoutes);
app.use("/api/roll-numbers", adminRollNumbersRoutes);
// Admin API routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/news", adminNewsRoutes);
app.use("/api/admin/gallery", adminGalleryRoutes);
app.use("/api/admin/videos", adminVideoRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/contacts", adminContactRoutes);
app.use("/api/admin/faculty", adminFacultyRoutes);
app.use("/api/admin/examinations", adminExaminationRoutes);
// app.use("/api/examinations", adminExaminationRoutes);
app.use("/api/admin/admissions", adminAdmissionRoutes);
app.use("/api/admin/activities", adminActivityRoutes);
app.use("/api/admin/roll-numbers", adminRollNumbersRoutes);
app.use("/api/admin/alumni", adminAlumniRoute)

// Serve React frontend in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));

  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "College Website API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  }
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : {},
  });
});

// 404 handler - must be the last route
app.use((req, res) => {
  res.status(404).json({ message: "API endpoint not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
