import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    image: {
      cloudinaryId: {
        type: String,
        required: false, // Make optional for backward compatibility
      },
      url: {
        type: String,
        required: function () {
          // Require URL if it's a new Cloudinary upload, or if path is not provided (legacy)
          return this.cloudinaryId || !this.filename;
        },
      },
      thumbnailUrl: {
        type: String,
        required: false,
      },
      originalName: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      mimetype: {
        type: String,
        required: true,
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
    category: {
      type: String,
      enum: [
        "campus",
        "events",
        "sports",
        "academics",
        "achievements",
        "facilities",
      ],
      default: "campus",
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for search and sorting
gallerySchema.index({ category: 1, displayOrder: 1 });
gallerySchema.index({ tags: 1 });

export default mongoose.model("Gallery", gallerySchema);
