import mongoose from "mongoose";

const alumniRegistrationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    maxlength: [100, "Full name cannot exceed 100 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, "Phone number cannot exceed 20 characters"]
  },
  graduationYear: {
    type: String,
    required: [true, "Graduation year is required"],
    trim: true
  },
  program: {
    type: String,
    required: [true, "Program is required"],
    trim: true,
    maxlength: [100, "Program cannot exceed 100 characters"]
  },
  profession: {
    type: String,
    trim: true,
    maxlength: [100, "Profession cannot exceed 100 characters"]
  },
  message: {
    type: String,
    trim: true,
    maxlength: [500, "Message cannot exceed 500 characters"]
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },
  reviewedAt: {
    type: Date
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [500, "Remarks cannot exceed 500 characters"]
  }
}, {
  timestamps: true
});

// Index for better query performance
alumniRegistrationSchema.index({ email: 1 });
alumniRegistrationSchema.index({ status: 1 });
alumniRegistrationSchema.index({ graduationYear: 1 });
alumniRegistrationSchema.index({ registrationDate: -1 });

const Alumni = mongoose.model("Alumni", alumniRegistrationSchema);

export default Alumni;