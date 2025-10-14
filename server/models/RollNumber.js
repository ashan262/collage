import mongoose from "mongoose";

const rollNumberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    program: {
      type: String,
      required: true,
      enum: ["HSSC", "BS"],
    },
    color: {
      type: String,
      default: "blue",
      enum: ["blue", "red", "green", "purple", "indigo", "orange"],
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    academicYear: {
      type: String,
      required: true,
      default: "2025-26",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      // required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    metadata: {
      description: String,
      tags: [String],
      category: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for searching
rollNumberSchema.index({
  name: "text",
  session: "text",
  academicYear: "text",
});

// Index for filtering
rollNumberSchema.index({ program: 1, isActive: 1 });
rollNumberSchema.index({ academicYear: 1, isActive: 1 });

export default mongoose.model("RollNumber", rollNumberSchema);
