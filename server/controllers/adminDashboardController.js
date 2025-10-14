import News from "../models/News.js";
import Gallery from "../models/Gallery.js";
import Contact from "../models/Contact.js";
import Admin from "../models/Admin.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
  try {
    // Get current date ranges
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Basic counts
    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: "published" });
    const totalGallery = await Gallery.countDocuments();
    const totalContacts = await Contact.countDocuments();

    // Monthly stats
    const newsThisMonth = await News.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    const contactsThisMonth = await Contact.countDocuments({
      createdAt: { $gte: thisMonth },
    });

    // Recent activity
    const recentNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title status createdAt")
      .populate("author", "fullName");

    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email subject createdAt");

    // Category breakdown
    const newsByCategory = await News.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const galleryByCategory = await Gallery.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Monthly trends (last 6 months)
    const monthlyTrends = await News.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(today.getTime() - 6 * 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalNews,
          publishedNews,
          totalGallery,
          totalContacts,
          newsThisMonth,
          contactsThisMonth,
        },
        recentActivity: {
          news: recentNews,
          contacts: recentContacts,
        },
        categoryBreakdown: {
          news: newsByCategory,
          gallery: galleryByCategory,
        },
        trends: monthlyTrends,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/admin/dashboard/activities
// @access  Private (Admin)
const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent news
    const recentNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title status createdAt updatedAt")
      .populate("author", "fullName");

    // Get recent gallery additions
    const recentGallery = await Gallery.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("title category createdAt");

    // Get recent contact submissions
    const recentContacts = await Contact.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email subject category createdAt");

    // Combine and sort all activities
    const activities = [];

    recentNews.forEach((item) => {
      activities.push({
        type: "news",
        action: "created",
        title: item.title,
        author: item.author?.fullName,
        timestamp: item.createdAt,
        status: item.status,
      });
    });

    recentGallery.forEach((item) => {
      activities.push({
        type: "gallery",
        action: "uploaded",
        title: item.title,
        category: item.category,
        timestamp: item.createdAt,
      });
    });

    recentContacts.forEach((item) => {
      activities.push({
        type: "contact",
        action: "submitted",
        title: `Message from ${item.name}`,
        subject: item.subject,
        timestamp: item.createdAt,
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.json({
      success: true,
      data: limitedActivities,
    });
  } catch (error) {
    console.error("Get recent activities error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export { getDashboardStats, getRecentActivities };
