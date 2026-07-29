const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    coverLetter: { type: String, required: true },
    proposedBudget: { type: Number, required: true },
    estimatedDuration: { type: String, required: true }, // e.g. "2 weeks", "1 month"
    attachments: [{ name: String, url: String }],
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// A freelancer can only have one *active* (non-withdrawn/rejected) proposal per job.
proposalSchema.index({ job: 1, freelancer: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);