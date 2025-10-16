import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },
    videoId: {
      type: String,
      required: true,
      trim: true,
      // For YouTube videos, this will be the video ID
      // For other platforms, this could be their equivalent identifier
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      // Auto-generated for YouTube videos, can be custom for others
    },
    platform: {
      type: String,
      enum: ["youtube", "vimeo", "direct", "other"],
      default: "youtube",
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Campus Life",
        "Academics",
        "Student Life",
        "Sports",
        "Events",
        "Facilities",
        "Announcements",
        "Other",
      ],
      default: "Other",
    },
    duration: {
      type: String, // Format: "5:23" (MM:SS) or "1:05:30" (HH:MM:SS)
      required: true,
    },
    views: {
      type: String,
      default: "0",
      // Stored as string to handle "1.2K", "500", etc.
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    metadata: {
      // For storing additional platform-specific data
      originalUploadDate: Date,
      channelName: String,
      channelUrl: String,
      quality: String, // "720p", "1080p", etc.
      embedCode: String, // Custom embed code if needed
    },
    statistics: {
      likes: { type: Number, default: 0 },
      dislikes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    // Admin fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
videoSchema.index({ category: 1, isPublished: 1 });
videoSchema.index({ uploadDate: -1 });
videoSchema.index({ isFeatured: -1, isPublished: 1 });
videoSchema.index({ title: "text", description: "text", tags: "text" });

// Virtual for YouTube embed URL
videoSchema.virtual("embedUrl").get(function () {
  if (this.platform === "youtube") {
    return `https://www.youtube.com/embed/${this.videoId}?rel=0&modestbranding=1`;
  }
  return this.videoUrl;
});

// Virtual for auto-generated YouTube thumbnail
videoSchema.virtual("autoThumbnail").get(function () {
  if (this.platform === "youtube") {
    return `https://img.youtube.com/vi/${this.videoId}/maxresdefault.jpg`;
  }
  return this.thumbnailUrl;
});

// Method to extract video ID from various YouTube URL formats
videoSchema.statics.extractYouTubeId = function (url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];

  for (let pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Pre-save middleware to auto-extract video ID and set thumbnail for YouTube videos
videoSchema.pre("save", function (next) {
  if (this.platform === "youtube" && this.videoUrl && !this.videoId) {
    const extractedId = this.constructor.extractYouTubeId(this.videoUrl);
    if (extractedId) {
      this.videoId = extractedId;
      // Auto-set thumbnail if not provided
      if (!this.thumbnailUrl) {
        this.thumbnailUrl = `https://img.youtube.com/vi/${extractedId}/maxresdefault.jpg`;
      }
    }
  }
  next();
});

// Method to get formatted duration
videoSchema.methods.getFormattedDuration = function () {
  return this.duration;
};

// Method to get formatted view count
videoSchema.methods.getFormattedViews = function () {
  const views = parseInt(this.views);
  if (isNaN(views)) return this.views;

  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views.toString();
};

// Method to check if video is embeddable
videoSchema.methods.isEmbeddable = function () {
  return this.platform !== "direct" || this.videoUrl.includes("embed");
};

const Video = mongoose.model("Video", videoSchema);

export default Video;
