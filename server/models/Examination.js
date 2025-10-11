import mongoose from "mongoose";

const examinationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "schedule",
        "result",
        "rule",
        "admit-card",
        "appeal",
        "announcement",
      ],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    examDate: {
      type: Date,
      // Required for schedule type
    },
    examTime: {
      type: String,
      // Format: "09:00 AM - 12:00 PM"
    },
    subject: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    class: {
      type: String,
      required: true,
      enum: ["HSSC-I", "HSSC-II", "BS-I", "BS-II", "BS-III", "BS-IV", "All"],
    },
    program: {
      type: String,
      trim: true,
      maxlength: 100,
      // e.g., "Pre-Medical", "Pre-Engineering", "Computer Science"
    },
    venue: {
      type: String,
      trim: true,
      maxlength: 200,
    },
    duration: {
      type: String,
      // e.g., "3 hours"
    },
    totalMarks: {
      type: Number,
      min: 0,
    },
    passingMarks: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled", "postponed"],
      default: "upcoming",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    // For results
    resultData: {
      passPercentage: Number,
      totalStudents: Number,
      passedStudents: Number,
      toppers: [
        {
          name: String,
          rollNumber: String,
          marks: Number,
          percentage: Number,
        },
      ],
    },
    // For admit cards
    admitCardInfo: {
      downloadStartDate: Date,
      downloadEndDate: Date,
      instructions: [String],
      requiredDocuments: [String],
    },
    // File attachments
    attachments: [
      {
        filename: String,
        originalName: String,
        fileUrl: String,
        fileType: String, // pdf, doc, image
        fileSize: Number,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Important dates
    importantDates: [
      {
        title: String,
        date: Date,
        description: String,
      },
    ],
    // Rules and instructions
    rules: [String],
    instructions: [String],

    // Tags for better organization
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Admin fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
      // For announcements that should be automatically hidden
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
examinationSchema.index({ type: 1, class: 1, isPublished: 1 });
examinationSchema.index({ examDate: 1, status: 1 });
examinationSchema.index({ isFeatured: -1, publishDate: -1 });
examinationSchema.index({
  title: "text",
  description: "text",
  subject: "text",
});

// Virtual for formatted exam date
examinationSchema.virtual("formattedExamDate").get(function () {
  if (!this.examDate) return null;
  return this.examDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for time remaining until exam
examinationSchema.virtual("timeRemaining").get(function () {
  if (!this.examDate || this.status !== "upcoming") return null;

  const now = new Date();
  const examDate = new Date(this.examDate);
  const timeDiff = examDate.getTime() - now.getTime();

  if (timeDiff <= 0) return "Exam time has passed";

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
  } else {
    return "Less than 1 hour remaining";
  }
});

// Method to check if announcement is active
examinationSchema.methods.isActive = function () {
  const now = new Date();
  if (this.expiryDate && now > this.expiryDate) return false;
  if (this.publishDate && now < this.publishDate) return false;
  return this.isPublished;
};

// Method to get status color for UI
examinationSchema.methods.getStatusColor = function () {
  const statusColors = {
    upcoming: "blue",
    ongoing: "green",
    completed: "gray",
    cancelled: "red",
    postponed: "yellow",
  };
  return statusColors[this.status] || "gray";
};

// Method to get priority color for UI
examinationSchema.methods.getPriorityColor = function () {
  const priorityColors = {
    low: "gray",
    medium: "blue",
    high: "orange",
    urgent: "red",
  };
  return priorityColors[this.priority] || "gray";
};

// Pre-save middleware to update status based on exam date
examinationSchema.pre("save", function (next) {
  if (this.type === "schedule" && this.examDate) {
    const now = new Date();
    const examDate = new Date(this.examDate);
    const examEndTime = new Date(examDate);

    // Assuming 3 hours duration if not specified
    const durationHours = this.duration
      ? parseInt(this.duration.match(/\d+/)?.[0]) || 3
      : 3;
    examEndTime.setHours(examEndTime.getHours() + durationHours);

    if (now < examDate) {
      this.status = "upcoming";
    } else if (now >= examDate && now <= examEndTime) {
      this.status = "ongoing";
    } else {
      this.status = "completed";
    }
  }
  next();
});

const Examination = mongoose.model("Examination", examinationSchema);

export default Examination;
