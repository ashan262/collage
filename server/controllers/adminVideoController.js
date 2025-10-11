import Video from "../models/Video.js";
import { validationResult } from "express-validator";

// Get all videos with pagination and filtering
const getVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      platform,
      isPublished,
      isFeatured,
      search,
      sortBy = "uploadDate",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    if (platform && platform !== "all") {
      filter.platform = platform;
    }

    if (isPublished !== undefined) {
      filter.isPublished = isPublished === "true";
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const videos = await Video.find(filter)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Video.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        videos,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVideos: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
      error: error.message,
    });
  }
};

// Get public videos (for frontend)
const getPublicVideos = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      platform,
      isFeatured,
      search,
    } = req.query;

    // Build filter object - only published videos
    const filter = { isPublished: true };

    if (category && category !== "all") {
      filter.category = category;
    }

    if (platform && platform !== "all") {
      filter.platform = platform;
    }

    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured === "true";
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query - sort by featured first, then by upload date
    const videos = await Video.find(filter)
      .sort({ isFeatured: -1, uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-createdBy -lastModifiedBy -__v"); // Exclude admin fields

    // Get total count for pagination
    const total = await Video.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    // Get categories for filtering
    const categories = await Video.distinct("category", { isPublished: true });

    res.json({
      success: true,
      data: {
        videos,
        categories,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalVideos: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch videos",
      error: error.message,
    });
  }
};

// Get single video by ID
const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id)
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch video",
      error: error.message,
    });
  }
};

// Create new video
const createVideo = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const videoData = {
      ...req.body,
      createdBy: req.admin.id,
    };

    // If it's a YouTube URL, extract the video ID
    if (videoData.platform === "youtube" && videoData.videoUrl) {
      const videoId = Video.extractYouTubeId(videoData.videoUrl);
      if (videoId) {
        videoData.videoId = videoId;
        // Auto-set thumbnail if not provided
        if (!videoData.thumbnailUrl) {
          videoData.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
    }

    const video = new Video(videoData);
    await video.save();

    // Populate the created video
    await video.populate("createdBy", "fullName email");

    res.status(201).json({
      success: true,
      message: "Video created successfully",
      data: video,
    });
  } catch (error) {
    console.error("Error creating video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create video",
      error: error.message,
    });
  }
};

// Update video
const updateVideo = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastModifiedBy: req.admin.id,
    };

    // If it's a YouTube URL, extract the video ID
    if (updateData.platform === "youtube" && updateData.videoUrl) {
      const videoId = Video.extractYouTubeId(updateData.videoUrl);
      if (videoId) {
        updateData.videoId = videoId;
        // Auto-set thumbnail if not provided
        if (!updateData.thumbnailUrl) {
          updateData.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
    }

    const video = await Video.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "fullName email")
      .populate("lastModifiedBy", "fullName email");

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.json({
      success: true,
      message: "Video updated successfully",
      data: video,
    });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update video",
      error: error.message,
    });
  }
};

// Delete video
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete video",
      error: error.message,
    });
  }
};

// Bulk delete videos
const bulkDeleteVideos = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of video IDs",
      });
    }

    const result = await Video.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `${result.deletedCount} videos deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting videos:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete videos",
      error: error.message,
    });
  }
};

// Toggle featured status
const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.isFeatured = !video.isFeatured;
    video.lastModifiedBy = req.admin.id;
    await video.save();

    res.json({
      success: true,
      message: `Video ${
        video.isFeatured ? "featured" : "unfeatured"
      } successfully`,
      data: { isFeatured: video.isFeatured },
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update featured status",
      error: error.message,
    });
  }
};

// Toggle published status
const togglePublished = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "Video not found",
      });
    }

    video.isPublished = !video.isPublished;
    video.lastModifiedBy = req.admin.id;
    await video.save();

    res.json({
      success: true,
      message: `Video ${
        video.isPublished ? "published" : "unpublished"
      } successfully`,
      data: { isPublished: video.isPublished },
    });
  } catch (error) {
    console.error("Error toggling published status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update published status",
      error: error.message,
    });
  }
};

// Get video statistics
const getVideoStats = async (req, res) => {
  try {
    const stats = await Video.aggregate([
      {
        $group: {
          _id: null,
          totalVideos: { $sum: 1 },
          publishedVideos: {
            $sum: { $cond: [{ $eq: ["$isPublished", true] }, 1, 0] },
          },
          featuredVideos: {
            $sum: { $cond: [{ $eq: ["$isFeatured", true] }, 1, 0] },
          },
          totalViews: {
            $sum: {
              $convert: {
                input: "$views",
                to: "int",
                onError: 0,
                onNull: 0,
              },
            },
          },
        },
      },
    ]);

    const categoryStats = await Video.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const platformStats = await Video.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalVideos: 0,
          publishedVideos: 0,
          featuredVideos: 0,
          totalViews: 0,
        },
        byCategory: categoryStats,
        byPlatform: platformStats,
      },
    });
  } catch (error) {
    console.error("Error fetching video stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch video statistics",
      error: error.message,
    });
  }
};

export {
  getVideos,
  getPublicVideos,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  bulkDeleteVideos,
  toggleFeatured,
  togglePublished,
  getVideoStats,
};
