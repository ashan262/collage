import Faculty from "../models/Faculty.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Get all faculty with admin details
// @route   GET /api/admin/faculty
// @access  Private (Admin)
const getAllFaculty = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, department, search } = req.query;

    const query = {};

    if (status) query.status = status;
    if (department) query.department = department;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { designation: { $regex: search, $options: "i" } },
        { department: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    const faculty = await Faculty.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Faculty.countDocuments(query);

    res.json({
      success: true,
      data: {
        faculty,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get all faculty error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get single faculty member
// @route   GET /api/admin/faculty/:id
// @access  Private (Admin)
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    res.json({
      success: true,
      data: faculty,
    });
  } catch (error) {
    console.error("Get faculty by id error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Create new faculty member
// @route   POST /api/admin/faculty
// @access  Private (Admin)
const createFaculty = async (req, res) => {
  try {
    const {
      name,
      designation,
      department,
      email,
      phone,
      experience,
      qualifications,
      specialization,
      subjects,
      achievements,
      bio,
      status,
      displayOrder,
    } = req.body;

    // Validation
    if (!name || !designation || !department) {
      return res.status(400).json({
        success: false,
        message: "Name, designation, and department are required",
      });
    }

    const facultyData = {
      name,
      designation,
      department,
      email,
      phone,
      experience,
      qualifications,
      specialization,
      subjects: subjects ? JSON.parse(subjects) : [],
      achievements: achievements ? JSON.parse(achievements) : [],
      bio,
      status: status || "active",
      displayOrder: displayOrder || 0,
    };

    // Handle image upload
    if (req.file) {
      facultyData.image = {
        cloudinaryId: req.file.public_id,
        url: req.file.path,
        thumbnailUrl: req.file.path.replace(
          "/upload/",
          "/upload/w_400,h_400,c_fill,g_face,f_auto,q_auto/"
        ),
        originalName: req.file.originalname,
        size: req.file.bytes || req.file.size,
        mimetype: req.file.mimetype,
        // Keep legacy fields for compatibility
        filename: req.file.filename || req.file.public_id,
        path: req.file.path,
      };
    }

    const faculty = new Faculty(facultyData);
    await faculty.save();

    res.status(201).json({
      success: true,
      message: "Faculty member created successfully",
      data: faculty,
    });
  } catch (error) {
    console.error("Create faculty error:", error);

    // Clean up uploaded file from Cloudinary if faculty creation failed
    if (req.file && req.file.public_id) {
      try {
        await deleteFromCloudinary(req.file.public_id);
      } catch (unlinkError) {
        console.error("Error deleting file from Cloudinary:", unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Update faculty member
// @route   PUT /api/admin/faculty/:id
// @access  Private (Admin)
const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    const {
      name,
      designation,
      department,
      email,
      phone,
      experience,
      qualifications,
      specialization,
      subjects,
      achievements,
      bio,
      status,
      displayOrder,
      deleteImage,
    } = req.body;

    // Update fields (always update, even if empty to allow clearing)
    faculty.name = name || faculty.name;
    faculty.designation = designation || faculty.designation;
    faculty.department = department || faculty.department;
    faculty.email = email || "";
    faculty.phone = phone || "";
    faculty.experience = experience || "";
    faculty.qualifications = qualifications || "";
    faculty.specialization = specialization || "";
    faculty.bio = bio || "";
    faculty.status = status || faculty.status;
    faculty.displayOrder =
      displayOrder !== undefined
        ? parseInt(displayOrder)
        : faculty.displayOrder;

    // Update arrays
    if (subjects) faculty.subjects = JSON.parse(subjects);
    if (achievements) faculty.achievements = JSON.parse(achievements);

    // Handle image deletion
    if (deleteImage === "true") {
      if (faculty.image && faculty.image.cloudinaryId) {
        try {
          await deleteFromCloudinary(faculty.image.cloudinaryId);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
        }
      }
      faculty.image = undefined;
    }

    // Handle image upload (new image)
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (faculty.image && faculty.image.cloudinaryId) {
        try {
          await deleteFromCloudinary(faculty.image.cloudinaryId);
        } catch (error) {
          console.error("Error deleting old image from Cloudinary:", error);
        }
      }

      faculty.image = {
        cloudinaryId: req.file.public_id,
        url: req.file.path,
        thumbnailUrl: req.file.path.replace(
          "/upload/",
          "/upload/w_400,h_400,c_fill,g_face,f_auto,q_auto/"
        ),
        originalName: req.file.originalname,
        size: req.file.bytes || req.file.size,
        mimetype: req.file.mimetype,
        // Keep legacy fields for compatibility
        filename: req.file.filename || req.file.public_id,
        path: req.file.path,
      };
    }

    await faculty.save();

    res.json({
      success: true,
      message: "Faculty member updated successfully",
      data: faculty,
    });
  } catch (error) {
    console.error("Update faculty error:", error);

    // Clean up uploaded file from Cloudinary if faculty update failed
    if (req.file && req.file.public_id) {
      try {
        await deleteFromCloudinary(req.file.public_id);
      } catch (unlinkError) {
        console.error("Error deleting file from Cloudinary:", unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Delete faculty member
// @route   DELETE /api/admin/faculty/:id
// @access  Private (Admin)
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty member not found",
      });
    }

    // Delete associated image from Cloudinary
    if (faculty.image && faculty.image.cloudinaryId) {
      try {
        await deleteFromCloudinary(faculty.image.cloudinaryId);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await Faculty.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Faculty member deleted successfully",
    });
  } catch (error) {
    console.error("Delete faculty error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// @desc    Get faculty stats
// @route   GET /api/admin/faculty/stats
// @access  Private (Admin)
const getFacultyStats = async (req, res) => {
  try {
    const totalFaculty = await Faculty.countDocuments();
    const activeFaculty = await Faculty.countDocuments({ status: "active" });
    const inactiveFaculty = await Faculty.countDocuments({
      status: "inactive",
    });

    // Get faculty by department
    const departmentStats = await Faculty.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        total: totalFaculty,
        active: activeFaculty,
        inactive: inactiveFaculty,
        departments: departmentStats,
      },
    });
  } catch (error) {
    console.error("Get faculty stats error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyStats,
};
