const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    deadline: { type: Date },
    skillsRequired: [{ type: String }],
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    locationType: {
      type: String,
      enum: ['remote', 'hybrid', 'onsite'],
      default: 'remote',
    },
    status: {
      type: String,
      enum: ['open', 'closed', 'completed'],
      default: 'open',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposalCount: { type: Number, default: 0 }, // denormalized counter, Phase 5 keeps this in sync
  },
  { timestamps: true }
);

// Supports keyword search across title/description; skills/category/budget
// are filtered via plain query matches (see resolvers/job.js).
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ category: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);