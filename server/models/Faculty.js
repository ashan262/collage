import mongoose from "mongoose";

const facultySchema = new mongoose.Schema(
  {
    // Basic Information
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },

    // Professional Information
    experience: {
      type: String,
      required: false,
      trim: true,
    },
    qualifications: {
      type: String,
      required: false,
      trim: true,
    },
    specialization: {
      type: String,
      required: false,
      trim: true,
    },

    // Teaching Information
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],

    // Professional Background
    achievements: [
      {
        type: String,
        trim: true,
      },
    ],

    // Personal Information
    bio: {
      type: String,
      required: false,
      trim: true,
    },

    // Media
    image: {
      cloudinaryId: {
        type: String,
        required: false,
      },
      url: {
        type: String,
        required: false,
      },
      thumbnailUrl: {
        type: String,
        required: false,
      },
      originalName: {
        type: String,
        required: false,
      },
      size: {
        type: Number,
        required: false,
      },
      mimetype: {
        type: String,
        required: false,
      },
      // Keep legacy fields for migration compatibility
      filename: {
        type: String,
        required: false,
      },
      path: {
        type: String,
        required: false,
      },
    },

    // Status and Metadata
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },

    // Order for display
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
facultySchema.index({ department: 1, status: 1 });
facultySchema.index({ displayOrder: 1 });

const Faculty = mongoose.model("Faculty", facultySchema);

export default Faculty;
