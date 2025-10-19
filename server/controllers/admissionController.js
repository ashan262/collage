import Admission from "../models/Admission.js";

const getPublicAdmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, program, academicYear } = req.query;

    const filter = { isPublished: true };

    if (type && type !== "all") filter.type = type;
    if (program && program !== "all") filter.program = program;
    if (academicYear) filter.academicYear = academicYear;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const admissions = await Admission.find(filter)
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select("-createdBy -lastModifiedBy -__v");

    const total = await Admission.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        admissions,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalAdmissions: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching public admissions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admissions",
      error: error.message,
    });
  }
};

export {getPublicAdmissions}