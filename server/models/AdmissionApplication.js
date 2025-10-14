import mongoose from "mongoose";

const admissionApplicationSchema = new mongoose.Schema(
  {
    admissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admission",
      required: true,
    },

    // --- PERSONAL INFORMATION ---
    fullName: { type: String, required: true },
    fatherName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    cnic: { type: String, required: true },
    nationality: { type: String, required: true },
    religion: { type: String },
    contactNumber: { type: String, required: true },
    email: { type: String, required: true },
    permanentAddress: { type: String, required: true },
    currentAddress: { type: String },

    // --- BACKGROUND / CATEGORY ---
    applicantType: {
      type: String,
      enum: [
        "Serving Army Personnel",
        "Retired Army Personnel",
        "Defense Employee (Civil)",
        "Serving Civilian (Non-Defense)",
        "Others",
      ],
      required: true,
    },
    otherApplicantType: { type: String },

    // --- ACADEMIC INFORMATION ---
    lastInstitution: { type: String, required: true },
    matricTotalMarks: { type: Number, required: true },
    matricObtainedMarks: { type: Number, required: true },
    matricYear: { type: Number, required: true },
    matricBoard: { type: String, required: true },

    interTotalMarks: { type: Number },
    interObtainedMarks: { type: Number },
    interYear: { type: Number },
    programApplied: {
      type: String,
      required: true,
    },
    classApplied: {
      type: String,
      required: true,
    },

    // --- DOCUMENTS (URLs or file paths) ---
    documents: {
      photo: String,
      sscCertificate: String,
      sscDMC: String,
      interCertificate: String,
      interDMC: String,
      cnicCopy: String,
      guardianCnicCopy: String,
      domicile: String,
      serviceCertificate: String,
    },

    // --- GUARDIAN INFORMATION ---
    guardianOccupation: { type: String, required: true },
    guardianIncome: { type: Number },
    guardianContact: { type: String, required: true },

    // --- DECLARATION ---
    declarationAccepted: { type: Boolean, required: true },

    // --- ADMIN / STATUS TRACKING ---
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    remarks: { type: String },
  },
  { timestamps: true }
);

const AdmissionApplication = mongoose.model(
  "AdmissionApplication",
  admissionApplicationSchema
);

export default AdmissionApplication;
