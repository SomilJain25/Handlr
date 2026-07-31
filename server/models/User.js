const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ['freelancer', 'client', 'admin'],
      required: true,
    },
    profilePicture: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    isSuspended: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    refreshTokens: [{ type: String, select: false }], // supports multi-device logout
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    // ---- Freelancer-only fields (Phase 3 will expand these) ----
    bio: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [{ type: mongoose.Schema.Types.Mixed }],
    education: [{ type: mongoose.Schema.Types.Mixed }],
    hourlyRate: { type: Number },
    availability: {
      type: String,
      enum: ['full_time', 'part_time', 'not_available'],
    },
    resumeUrl: { type: String },
    portfolio: [{ title: String, url: String, image: String }],
    github: String,
    linkedin: String,
    website: String,

    // ---- Client-only fields (Phase 3 will expand these) ----
    companyName: String,
    companyLogo: String,
    industry: String,
    description: String,
    contactNumber: String,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);