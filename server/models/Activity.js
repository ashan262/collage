import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "event",
        "photo-gallery",
        "achievement",
        "announcement",
        "competition",
        "workshop",
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
    category: {
      type: String,
      required: true,
      enum: [
        "Sports",
        "Academic",
        "Cultural",
        "Social",
        "Alumni",
        "Co-Curricular",
        "Other",
      ],
    },
    subCategory: {
      type: String,
      trim: true,
      // e.g., "Football", "Cricket", "Debate", "Science Fair"
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled", "postponed"],
      default: "upcoming",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
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

    // Event details
    eventDetails: {
      startDate: Date,
      endDate: Date,
      startTime: String, // "09:00 AM"
      endTime: String, // "05:00 PM"
      venue: String,
      capacity: Number,
      registrationRequired: {
        type: Boolean,
        default: false,
      },
      registrationDeadline: Date,
      registrationFee: Number,
      contactPerson: {
        name: String,
        phone: String,
        email: String,
      },
    },

    // Photo gallery
    photoGallery: [
      {
        imageUrl: {
          type: String,
          required: true,
        },
        thumbnailUrl: String,
        caption: String,
        description: String,
        photographer: String,
        location: String,
        datePhotoTaken: Date,
        tags: [String],
        order: {
          type: Number,
          default: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],

    // Achievement details
    achievementDetails: {
      achiever: {
        name: String,
        class: String,
        rollNumber: String,
        program: String,
      },
      achievement: String,
      position: String, // "1st", "2nd", "3rd", "Winner", "Runner-up"
      competition: String,
      organizer: String,
      level: {
        type: String,
        enum: [
          "college",
          "district",
          "regional",
          "provincial",
          "national",
          "international",
        ],
      },
      dateAchieved: Date,
      certificate: String, // URL to certificate image/pdf
      prize: String,
    },

    // Competition details
    competitionDetails: {
      eligibility: [String],
      rules: [String],
      prizes: [
        {
          position: String,
          prize: String,
          amount: Number,
        },
      ],
      judges: [String],
      coordinators: [
        {
          name: String,
          department: String,
          contact: String,
        },
      ],
      schedule: [
        {
          phase: String,
          date: Date,
          time: String,
          venue: String,
          description: String,
        },
      ],
    },

    // Workshop details
    workshopDetails: {
      instructor: {
        name: String,
        designation: String,
        organization: String,
        bio: String,
        photo: String,
      },
      prerequisites: [String],
      learningOutcomes: [String],
      materials: [String],
      certificate: {
        provided: Boolean,
        criteria: String,
      },
      targetAudience: [String],
    },

    // Participants/Attendees
    participants: [
      {
        name: String,
        class: String,
        rollNumber: String,
        program: String,
        email: String,
        phone: String,
        registrationDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["registered", "confirmed", "attended", "absent", "cancelled"],
          default: "registered",
        },
      },
    ],

    // Results (for competitions/events)
    results: [
      {
        position: String,
        participant: {
          name: String,
          class: String,
          rollNumber: String,
        },
        score: Number,
        remarks: String,
      },
    ],

    // File attachments
    attachments: [
      {
        filename: String,
        originalName: String,
        fileUrl: String,
        fileType: String, // pdf, doc, image, video
        fileSize: Number,
        description: String,
        uploadDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // External links
    externalLinks: [
      {
        title: String,
        url: String,
        description: String,
      },
    ],

    // Social media coverage
    socialMedia: {
      facebookPost: String,
      instagramPost: String,
      twitterPost: String,
      youtubeVideo: String,
      hashtags: [String],
    },

    // Statistics
    statistics: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
      registrations: {
        type: Number,
        default: 0,
      },
      attendance: {
        type: Number,
        default: 0,
      },
    },

    // Organization details
    organizedBy: {
      department: String,
      faculty: [String],
      students: [String],
      externalOrganizers: [String],
    },

    // Budget (optional)
    budget: {
      totalBudget: Number,
      spent: Number,
      currency: {
        type: String,
        default: "PKR",
      },
      breakdown: [
        {
          item: String,
          amount: Number,
          description: String,
        },
      ],
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
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
activitySchema.index({ type: 1, category: 1, isPublished: 1 });
activitySchema.index({ "eventDetails.startDate": 1, status: 1 });
activitySchema.index({ isFeatured: -1, publishDate: -1 });
activitySchema.index({ title: "text", description: "text", tags: "text" });
activitySchema.index({ category: 1, subCategory: 1 });

// Virtual for event duration
activitySchema.virtual("eventDuration").get(function () {
  if (!this.eventDetails?.startDate || !this.eventDetails?.endDate) return null;

  const start = new Date(this.eventDetails.startDate);
  const end = new Date(this.eventDetails.endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return "1 day";
  return `${diffDays} days`;
});

// Virtual for time remaining until event
activitySchema.virtual("timeUntilEvent").get(function () {
  if (!this.eventDetails?.startDate || this.status !== "upcoming") return null;

  const now = new Date();
  const eventDate = new Date(this.eventDetails.startDate);
  const timeDiff = eventDate.getTime() - now.getTime();

  if (timeDiff <= 0) return "Event has started";

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
  } else {
    return "Starting soon";
  }
});

// Virtual for active photo count
activitySchema.virtual("activePhotoCount").get(function () {
  return this.photoGallery?.filter((photo) => photo.isActive).length || 0;
});

// Method to check if registration is open
activitySchema.methods.isRegistrationOpen = function () {
  if (!this.eventDetails?.registrationRequired) return false;

  const now = new Date();
  const deadline = this.eventDetails.registrationDeadline;

  return (
    this.status === "upcoming" &&
    this.isPublished &&
    (!deadline || now <= deadline)
  );
};

// Method to get status color for UI
activitySchema.methods.getStatusColor = function () {
  const statusColors = {
    upcoming: "blue",
    ongoing: "green",
    completed: "gray",
    cancelled: "red",
    postponed: "yellow",
  };
  return statusColors[this.status] || "gray";
};

// Method to get category color for UI
activitySchema.methods.getCategoryColor = function () {
  const categoryColors = {
    Sports: "green",
    Academic: "blue",
    Cultural: "purple",
    Social: "pink",
    Alumni: "orange",
    "Co-Curricular": "indigo",
    Other: "gray",
  };
  return categoryColors[this.category] || "gray";
};

// Method to get filtered photos by tags
activitySchema.methods.getPhotosByTag = function (tag) {
  return this.photoGallery.filter(
    (photo) => photo.isActive && photo.tags.includes(tag)
  );
};

// Method to calculate attendance percentage
activitySchema.methods.getAttendancePercentage = function () {
  const registered = this.statistics.registrations || 0;
  const attended = this.statistics.attendance || 0;

  if (registered === 0) return 0;
  return Math.round((attended / registered) * 100);
};

// Pre-save middleware to update statistics
activitySchema.pre("save", function (next) {
  // Update registration count
  this.statistics.registrations = this.participants?.length || 0;

  // Update attendance count
  this.statistics.attendance =
    this.participants?.filter((p) => p.status === "attended").length || 0;

  // Auto-update status based on event dates
  if (this.type === "event" && this.eventDetails?.startDate) {
    const now = new Date();
    const startDate = new Date(this.eventDetails.startDate);
    const endDate = this.eventDetails.endDate
      ? new Date(this.eventDetails.endDate)
      : startDate;

    if (now < startDate) {
      this.status = "upcoming";
    } else if (now >= startDate && now <= endDate) {
      this.status = "ongoing";
    } else {
      this.status = "completed";
    }
  }

  next();
});

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
