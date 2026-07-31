const Review = require('../../models/Review');
const Job = require('../../models/Job');
const Proposal = require('../../models/Proposal');
const User = require('../../models/User');
const { requireAuth, requireRole } = require('../../middleware/auth');
const { createNotification } = require('../../services/notificationService');

module.exports = {
  Query: {
    reviews: async (_, { userId, limit = 20, offset = 0 }) =>
      Review.find({ reviewee: userId }).sort({ createdAt: -1 }).skip(offset).limit(limit),

    reviewsForJob: async (_, { jobId }) => Review.find({ job: jobId }),
  },

  Mutation: {
    completeJob: async (_, { id }, context) => {
      const user = requireRole(context, ['client']);
      const job = await Job.findById(id);
      if (!job) throw new Error('Job not found.');
      if (job.client.toString() !== user.id) {
        const err = new Error('You do not own this job.');
        err.extensions = { code: 'FORBIDDEN' };
        throw err;
      }
      if (job.status !== 'closed') {
        throw new Error('Only a closed job (with a hired freelancer) can be marked complete.');
      }

      job.status = 'completed';
      await job.save();

      const acceptedProposal = await Proposal.findOne({ job: job._id, status: 'accepted' });
      if (acceptedProposal) {
        createNotification({
          recipient: acceptedProposal.freelancer,
          type: 'project_completed',
          title: 'Project marked complete',
          message: `"${job.title}" was marked complete. You can now leave a review.`,
          link: `/jobs/${job.id}`,
          relatedId: job._id,
        }).catch((err) => console.error('Notification failed:', err.message));
      }

      return job;
    },

    createReview: async (_, { input }, context) => {
      const user = requireAuth(context);
      const { jobId, revieweeId, rating, feedback } = input;

      if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5.');

      const job = await Job.findById(jobId);
      if (!job) throw new Error('Job not found.');
      if (job.status !== 'completed') {
        throw new Error('You can only review a job once it has been marked complete.');
      }

      const acceptedProposal = await Proposal.findOne({ job: jobId, status: 'accepted' });
      if (!acceptedProposal) throw new Error('This job has no hired freelancer to review.');

      const clientId = job.client.toString();
      const freelancerId = acceptedProposal.freelancer.toString();

      // Reviewer must be one of the two parties, reviewing the *other* party.
      const validPair =
        (user.id === clientId && revieweeId === freelancerId) ||
        (user.id === freelancerId && revieweeId === clientId);

      if (!validPair) {
        throw new Error('You are not eligible to review this user for this job.');
      }

      const existing = await Review.findOne({ job: jobId, reviewer: user.id });
      if (existing) throw new Error('You already reviewed this job.');

      const review = await Review.create({
        job: jobId,
        reviewer: user.id,
        reviewee: revieweeId,
        rating,
        feedback,
      });

      createNotification({
        recipient: revieweeId,
        type: 'new_review',
        title: 'New review received',
        message: `You received a ${rating}-star review on "${job.title}".`,
        link: `/jobs/${job.id}`,
        relatedId: review._id,
      }).catch((err) => console.error('Notification failed:', err.message));

      return review;
    },
  },

  Review: {
    id: (r) => r._id.toString(),
    job: (r) => Job.findById(r.job),
    reviewer: (r) => User.findById(r.reviewer),
    reviewee: (r) => User.findById(r.reviewee),
    createdAt: (r) => r.createdAt.toISOString(),
  },

  User: {
    averageRating: async (user) => {
      const result = await Review.aggregate([
        { $match: { reviewee: user._id } },
        { $group: { _id: null, avg: { $avg: '$rating' } } },
      ]);
      return result.length ? Math.round(result[0].avg * 10) / 10 : null;
    },
    reviewCount: async (user) => Review.countDocuments({ reviewee: user._id }),
  },
};