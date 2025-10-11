import mongoose from "mongoose";

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      maxlength: [5000, "Content cannot be more than 5000 characters"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot be more than 300 characters"],
    },
    category: {
      type: String,
      enum: ["announcement", "event", "news", "achievement", "admission"],
      default: "news",
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
    featured: {
      type: Boolean,
      default: false,
    },

    // Multiple images support
    images: [
      {
        cloudinaryId: {
          type: String,
          required: false,
        },
        url: {
          type: String,
          required: true,
        },
        thumbnailUrl: {
          type: String,
          required: false,
        },
        alt: {
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
    ],

    // Backward compatibility - keep single image field for existing data
    image: {
      url: String,
      alt: String,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    eventDate: {
      type: Date,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      unique: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create slug from title before saving
newsSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }
  next();
});

// Auto-generate excerpt if not provided
newsSchema.pre("save", function (next) {
  if (!this.excerpt && this.content) {
    this.excerpt =
      this.content.substring(0, 200) + (this.content.length > 200 ? "..." : "");
  }
  next();
});

// Index for search functionality
newsSchema.index({ title: "text", content: "text", tags: "text" });

export default mongoose.model("News", newsSchema);
