import mongoose from "mongoose";

const admissionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "announcement",
        "merit-list",
        "policy",
        "schedule",
        "fee-structure",
        "requirement",
        "form",
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
      maxlength: 3000,
    },
    academicYear: {
      type: String,
      required: true,
      // e.g., "2025-2026"
    },
    program: {
      type: String,
      required: true,
      enum: ["HSSC", "BS", "Both"],
    },
    specialization: {
      type: String,
      trim: true,
      // e.g., "Pre-Medical", "Pre-Engineering", "Computer Science"
    },
    class: {
      type: String,
      enum: ["HSSC-I", "HSSC-II", "BS-I", "BS-II", "BS-III", "BS-IV", "All"],
      default: "All",
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed", "archived"],
      default: "draft",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },

    // Important dates
    applicationStartDate: Date,
    applicationEndDate: Date,
    lastDateForFeeSubmission: Date,
    meritListDisplayDate: Date,
    admissionConfirmationDeadline: Date,
    classesStartDate: Date,

    // For merit lists
    meritListData: {
      totalSeats: Number,
      appliedStudents: Number,
      selectedStudents: Number,
      cutoffMarks: Number,
      cutoffPercentage: Number,
      lists: [
        {
          listNumber: Number, // 1st list, 2nd list, etc.
          displayDate: Date,
          confirmationDeadline: Date,
          students: [
            {
              serialNumber: Number,
              name: String,
              fatherName: String,
              rollNumber: String,
              marks: Number,
              percentage: Number,
              status: {
                type: String,
                enum: ["selected", "confirmed", "cancelled", "waiting"],
                default: "selected",
              },
            },
          ],
          waitingList: [
            {
              serialNumber: Number,
              name: String,
              fatherName: String,
              rollNumber: String,
              marks: Number,
              percentage: Number,
            },
          ],
        },
      ],
    },

    // Fee structure
    feeStructure: {
      admissionFee: Number,
      tuitionFee: Number,
      laboratoryFee: Number,
      libraryFee: Number,
      sportsComputerFee: Number,
      otherCharges: Number,
      total: Number,
      currency: {
        type: String,
        default: "PKR",
      },
      paymentMethods: [String],
      feeVouchers: [
        {
          bankName: String,
          accountTitle: String,
          accountNumber: String,
          branchCode: String,
        },
      ],
    },

    // Admission requirements
    requirements: {
      eligibilityToCriteria: [String],
      requiredDocuments: [String],
      minimumMarks: Number,
      minimumPercentage: Number,
      ageLimit: {
        minimum: Number,
        maximum: Number,
      },
      domicileRequirement: String,
      medicalRequirements: [String],
    },

    // Application process
    applicationProcess: {
      steps: [
        {
          stepNumber: Number,
          title: String,
          description: String,
          requiredDocuments: [String],
          deadline: Date,
        },
      ],
      onlineApplicationUrl: String,
      formDownloadUrl: String,
      submissionMethod: {
        type: String,
        enum: ["online", "offline", "both"],
        default: "both",
      },
      submissionAddress: String,
    },

    // Contact information
    contactInfo: {
      admissionOffice: {
        phone: [String],
        email: [String],
        address: String,
        timings: String,
      },
      helpline: {
        phone: [String],
        email: [String],
        whatsapp: String,
      },
    },

    // File attachments
    attachments: [
      {
        filename: String,
        originalName: String,
        fileUrl: String,
        fileType: String, // pdf, doc, image, excel
        fileSize: Number,
        description: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Important announcements
    announcements: [
      {
        title: String,
        message: String,
        type: {
          type: String,
          enum: ["info", "warning", "success", "error"],
          default: "info",
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        expiryDate: Date,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // FAQs
    faqs: [
      {
        question: String,
        answer: String,
        category: String,
        order: Number,
      },
    ],

    // Statistics
    statistics: {
      totalApplications: {
        type: Number,
        default: 0,
      },
      selectedStudents: {
        type: Number,
        default: 0,
      },
      confirmedAdmissions: {
        type: Number,
        default: 0,
      },
      lastUpdated: Date,
    },

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
    archiveDate: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
admissionSchema.index({ type: 1, program: 1, isPublished: 1 });
admissionSchema.index({ academicYear: 1, status: 1 });
admissionSchema.index({ isFeatured: -1, publishDate: -1 });
admissionSchema.index({ applicationStartDate: 1, applicationEndDate: 1 });
admissionSchema.index({ title: "text", description: "text" });

// Virtual for current admission status
admissionSchema.virtual("currentStatus").get(function () {
  const now = new Date();

  if (!this.isPublished) return "not-published";
  if (this.status === "closed" || this.status === "archived")
    return this.status;

  if (this.applicationStartDate && now < this.applicationStartDate) {
    return "not-started";
  }

  if (this.applicationEndDate && now > this.applicationEndDate) {
    return "applications-closed";
  }

  if (
    this.applicationStartDate &&
    this.applicationEndDate &&
    now >= this.applicationStartDate &&
    now <= this.applicationEndDate
  ) {
    return "applications-open";
  }

  return this.status;
});

// Virtual for days remaining for application
admissionSchema.virtual("daysRemaining").get(function () {
  if (!this.applicationEndDate || this.currentStatus !== "applications-open")
    return null;

  const now = new Date();
  const endDate = new Date(this.applicationEndDate);
  const timeDiff = endDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysRemaining > 0 ? daysRemaining : 0;
});

// Method to check if applications are currently open
admissionSchema.methods.areApplicationsOpen = function () {
  const now = new Date();
  return (
    this.isPublished &&
    this.status === "active" &&
    this.applicationStartDate &&
    now >= this.applicationStartDate &&
    this.applicationEndDate &&
    now <= this.applicationEndDate
  );
};

// Method to get status color for UI
admissionSchema.methods.getStatusColor = function () {
  const statusColors = {
    "not-published": "gray",
    "not-started": "blue",
    "applications-open": "green",
    "applications-closed": "orange",
    closed: "red",
    archived: "gray",
    draft: "yellow",
    active: "green",
  };
  return statusColors[this.currentStatus] || "gray";
};

// Method to calculate total fee
admissionSchema.methods.calculateTotalFee = function () {
  if (!this.feeStructure) return 0;

  const fees = this.feeStructure;
  return (
    (fees.admissionFee || 0) +
    (fees.tuitionFee || 0) +
    (fees.laboratoryFee || 0) +
    (fees.libraryFee || 0) +
    (fees.sportsComputerFee || 0) +
    (fees.otherCharges || 0)
  );
};

// Method to get active announcements
admissionSchema.methods.getActiveAnnouncements = function () {
  const now = new Date();
  return this.announcements.filter(
    (announcement) =>
      announcement.isActive &&
      (!announcement.expiryDate || announcement.expiryDate > now)
  );
};

// Pre-save middleware to calculate total fee
admissionSchema.pre("save", function (next) {
  if (this.feeStructure && this.isModified("feeStructure")) {
    this.feeStructure.total = this.calculateTotalFee();
  }
  next();
});

const Admission = mongoose.model("Admission", admissionSchema);

export default Admission;
