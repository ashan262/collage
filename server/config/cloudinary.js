import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Gallery Image Storage
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fgdc-kohat/gallery",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [
      { width: 1920, height: 1080, crop: "limit", quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomNum = Math.round(Math.random() * 1e9);
      return `gallery-${timestamp}-${randomNum}`;
    },
  },
});

// News Image Storage
const newsStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fgdc-kohat/news",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [
      { width: 1200, height: 800, crop: "limit", quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomNum = Math.round(Math.random() * 1e9);
      return `news-${timestamp}-${randomNum}`;
    },
  },
});

// Faculty Image Storage
const facultyStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fgdc-kohat/faculty",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      {
        width: 400,
        height: 400,
        crop: "fill",
        gravity: "face",
        quality: "auto:good",
      },
      { fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomNum = Math.round(Math.random() * 1e9);
      return `faculty-${timestamp}-${randomNum}`;
    },
  },
});

// Activity Image Storage (for dynamic activities)
const activityStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "fgdc-kohat/activities",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [
      { width: 1600, height: 900, crop: "limit", quality: "auto:good" },
      { fetch_format: "auto" },
    ],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const randomNum = Math.round(Math.random() * 1e9);
      return `activity-${timestamp}-${randomNum}`;
    },
  },
});

// Create multer instances for different image types
export const galleryUpload = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  },
});

export const newsUpload = multer({
  storage: newsStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  },
});

export const facultyUpload = multer({
  storage: facultyStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
    }
  },
});

export const activityUpload = multer({
  storage: activityStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
    }
  },
});

// Utility functions for Cloudinary operations
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
};

export const generateImageUrl = (publicId, transformations = {}) => {
  return cloudinary.url(publicId, transformations);
};

// Helper function to extract public_id from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  // Extract public_id from Cloudinary URL
  const matches = url.match(/\/v\d+\/(.+)\./);
  return matches ? matches[1] : null;
};

export default cloudinary;
