import AdmissionApplication from "../models/AdmissionApplication.js";
import Admission from "../models/Admission.js";

// ✅ POST: /api/admissions/apply
export const submitApplication = async (req, res) => {
  // console.log(req.body)
  try {
    const { admissionId, ...formData } = req.body;

    if (!admissionId) {
      return res.status(400).json({ message: "Admission ID is required" });
    }

    // Optional: verify admission exists
    const admission = await Admission.findById(admissionId);
    if (!admission) {
      return res.status(404).json({ message: "Admission not found" });
    }

    const application = await AdmissionApplication.create({
       admissionId,
      ...formData,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: application,
    });
  } catch (error) {
    console.error("Error submitting application:", error);
    res.status(500).json({ message: "Failed to submit application" });
  }
};

// ✅ GET: /api/admissions (Admin Panel)
export const getApplications = async (req, res) => {
  try {
    const applications = await AdmissionApplication.find()
      .populate("admissionId") // Optional for better admin view
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};
