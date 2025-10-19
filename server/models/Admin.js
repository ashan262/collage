import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const AdminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "content-manager"],
      default: "admin",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    permissions: {
      canManageNews: { type: Boolean, default: true },
      canManageGallery: { type: Boolean, default: true },
      canManageFaculty: { type: Boolean, default: true },
      canManageAdmissions: { type: Boolean, default: true },
      canManagePages: { type: Boolean, default: true },
      canManageContacts: { type: Boolean, default: true },
      canManageUsers: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
AdminSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
AdminSchema.methods.toJSON = function () {
  const admin = this.toObject();
  delete admin.password;
  return admin;
};

export default mongoose.model("Admin", AdminSchema);
