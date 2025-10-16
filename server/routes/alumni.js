import express from "express";
import Alumni from "../models/Alumni.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public route for alumni registration
router.post("/register", async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      graduationYear,
      program,
      profession,
      message
    } = req.body;

    // Check if email already exists
    const existingRegistration = await Alumni.findOne({ email });
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "An alumni registration with this email already exists"
      });
    }

    const registration = new Alumni({
      fullName,
      email,
      phone,
      graduationYear,
      program,
      profession,
      message,
      status: "pending",
      registrationDate: new Date()
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: "Alumni registration submitted successfully",
      data: registration
    });
  } catch (error) {
    console.error("Error submitting alumni registration:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit alumni registration",
      error: error.message
    });
  }
});

// Get approved alumni for public directory
router.get("/directory", async (req, res) => {
  try {
    const { 
      search, 
      graduationYear, 
      profession, 
      program,
      page = 1, 
      limit = 12 
    } = req.query;
    
    // Build filter - only show approved alumni
    const filter = { status: "approved" };
    
    // Add search filters
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { profession: { $regex: search, $options: "i" } }
      ];
    }
    
    if (graduationYear && graduationYear !== "all") {
      filter.graduationYear = graduationYear;
    }
    
    if (profession && profession !== "all") {
      filter.profession = { $regex: profession, $options: "i" };
    }
    
    if (program && program !== "all") {
      filter.program = { $regex: program, $options: "i" };
    }

    const alumni = await Alumni.find(filter)
      .select("fullName email graduationYear program profession    approvedAt")
      .sort({ approvedAt: -1, graduationYear: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Alumni.countDocuments(filter);

    // Get available filters for frontend
    const graduationYears = await Alumni.distinct("graduationYear", { status: "approved" });
    const professions = await Alumni.distinct("profession", { status: "approved" });
    const programs = await Alumni.distinct("program", { status: "approved" });

    res.status(200).json({
      success: true,
      data: alumni,
      filters: {
        graduationYears: graduationYears.sort().reverse(),
        professions: professions.filter(p => p).sort(),
        programs: programs.sort()
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAlumni: total
      }
    });
  } catch (error) {
    console.error("Error fetching alumni directory:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni directory",
      error: error.message
    });
  }
});

// // Get all alumni registrations
// router.get("admin/registrations", async (req, res) => {
//   try {
//     const { status, page = 1, limit = 10 } = req.query;
    
//     const filter = {};
//     if (status && status !== "all") {
//       filter.status = status;
//     }

//     const registrations = await Alumni.find(filter)
//       .sort({ registrationDate: -1 })
//       .limit(limit * 1)
//       .skip((page - 1) * limit)
//       .lean();

//     const total = await Alumni.countDocuments(filter);

//     res.status(200).json({
//       success: true,
//       data: registrations,
//       pagination: {
//         currentPage: parseInt(page),
//         totalPages: Math.ceil(total / limit),
//         totalRegistrations: total
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching alumni registrations:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch alumni registrations",
//       error: error.message
//     });
//   }
// });

// // Get single alumni registration
// router.get("/registrations/:id", async (req, res) => {
//   try {
//     const registration = await Alumni.findById(req.params.id).lean();

//     if (!registration) {
//       return res.status(404).json({
//         success: false,
//         message: "Alumni registration not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: registration
//     });
//   } catch (error) {
//     console.error("Error fetching alumni registration:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch alumni registration",
//       error: error.message
//     });
//   }
// });


// // Delete single alumni registration
// router.delete("/registrations/:id", async (req, res) => {
//   try {
//     const registration = await Alumni.findByIdAndDelete(req.params.id);

//     if (!registration) {
//       return res.status(404).json({
//         success: false,
//         message: "Alumni registration not found"
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Alumni registration deleted successfully"
//     });
//   } catch (error) {
//     console.error("Error deleting alumni registration:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete alumni registration",
//       error: error.message
//     });
//   }
// });

// // Delete all alumni registrations
// router.delete("/registrations", async (req, res) => {
//   try {
//     const result = await Alumni.deleteMany({});

//     res.status(200).json({
//       success: true,
//       message: "All alumni registrations deleted successfully",
//       deletedCount: result.deletedCount
//     });
//   } catch (error) {
//     console.error("Error deleting all alumni registrations:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to delete all alumni registrations",
//       error: error.message
//     });
//   }
// });

// // Get alumni registration statistics
// router.get("/statistics", async (req, res) => {
//   try {
//     const total = await Alumni.countDocuments();
//     const pending = await Alumni.countDocuments({ status: "pending" });
//     const approved = await Alumni.countDocuments({ status: "approved" });
//     const rejected = await Alumni.countDocuments({ status: "rejected" });

//     // Get registrations by graduation year
//     const byGraduationYear = await Alumni.aggregate([
//       {
//         $group: {
//           _id: "$graduationYear",
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { _id: -1 } }
//     ]);

//     // Get registrations by program
//     const byProgram = await Alumni.aggregate([
//       {
//         $group: {
//           _id: "$program",
//           count: { $sum: 1 }
//         }
//       },
//       { $sort: { count: -1 } }
//     ]);

//     res.status(200).json({
//       success: true,
//       data: {
//         total,
//         pending,
//         approved,
//         rejected,
//         byGraduationYear,
//         byProgram
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching alumni statistics:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch alumni statistics",
//       error: error.message
//     });
//   }
// });

export default router;