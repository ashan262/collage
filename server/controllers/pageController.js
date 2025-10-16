import PageContent from "../models/PageContent.js";

// @desc    Get page content
// @route   GET /api/pages/:pageId
// @access  Public
export const getPageContent = async (req, res) => {
  try {
    const { pageId } = req.params;

    const pageContent = await PageContent.findOne({
      pageId,
      isActive: true,
    });

    if (!pageContent) {
      return res.status(404).json({
        success: false,
        message: "Page content not found",
      });
    }

    res.status(200).json({
      success: true,
      data: pageContent,
    });
  } catch (error) {
    console.error("Get page content error:", error);
    res.status(500).json({
      success: false,
      message: "Server error getting page content",
    });
  }
};
