import mongoose from "mongoose";

const pageContentSchema = new mongoose.Schema(
  {
    pageId: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "home",
        "about",
        "academics",
        "admissions",
        "departments",
        "principal-message",
      ],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot be more than 200 characters"],
    },
    content: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    metaData: {
      description: {
        type: String,
        maxlength: [160, "Meta description cannot be more than 160 characters"],
      },
      keywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Increment version on update
pageContentSchema.pre("save", function (next) {
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  next();
});

export default mongoose.model("PageContent", pageContentSchema);
