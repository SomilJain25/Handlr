const Proposal = require('../../models/Proposal');
const Job = require('../../models/Job');
const { requireRole } = require('../../middleware/auth');
const { createNotification } = require('../../services/notificationService');

const ACTIVE_STATUSES = ['pending', 'shortlisted'];

const getOwnedJobProposal = async (proposalId, clientId) => {
  const proposal = await Proposal.findById(proposalId).populate('job');
  if (!proposal) throw new Error('Proposal not found.');
  if (proposal.job.client.toString() !== clientId) {
    const err = new Error('You do not own the job this proposal belongs to.');
    err.extensions = { code: 'FORBIDDEN' };
    throw err;
  }
  return proposal;
};

module.exports = {
  Query: {
    proposalsForJob: async (_, { jobId, status }, context) => {
      const user = requireRole(context, ['client']);
      const job = await Job.findById(jobId);
      if (!job) throw new Error('Job not found.');
      if (job.client.toString() !== user.id) {
        const err = new Error('You do not own this job.');
        err.extensions = { code: 'FORBIDDEN' };
        throw err;
      }

      const query = { job: jobId };
      if (status) query.status = status;
      return Proposal.find(query).sort({ createdAt: -1 });
    },

    myProposals: async (_, { status }, context) => {
      const user = requireRole(context, ['freelancer']);
      const query = { freelancer: user.id };
      if (status) query.status = status;
      return Proposal.find(query).sort({ createdAt: -1 });
    },

    proposal: async (_, { id }) => Proposal.findById(id),
  },

  Mutation: {
    applyJob: async (_, { jobId, input }, context) => {
      const user = requireRole(context, ['freelancer']);

      const job = await Job.findById(jobId);
      if (!job) throw new Error('Job not found.');
      if (job.status !== 'open') throw new Error('This job is no longer open.');

      const existing = await Proposal.findOne({
        job: jobId,
        freelancer: user.id,
        status: { $in: ACTIVE_STATUSES },
      });
      if (existing) {
        throw new Error('You already have an active proposal on this job.');
      }

      const proposal = await Proposal.create({
        job: jobId,
        freelancer: user.id,
        coverLetter: input.coverLetter,
        proposedBudget: input.proposedBudget,
        estimatedDuration: input.estimatedDuration,
        attachments: input.attachments || [],
      });

      job.proposalCount += 1;
      await job.save();

      createNotification({
        recipient: job.client,
        type: 'new_proposal',
        title: 'New proposal received',
        message: `You received a new proposal on "${job.title}".`,
        link: `/jobs/${job.id}/proposals`,
        relatedId: job._id,
      }).catch((err) => console.error('Notification failed:', err.message));

      return proposal;
    },

    withdrawProposal: async (_, { id }, context) => {
      const user = requireRole(context, ['freelancer']);
      const proposal = await Proposal.findById(id);
      if (!proposal) throw new Error('Proposal not found.');
      if (proposal.freelancer.toString() !== user.id) {
        const err = new Error('This is not your proposal.');
        err.extensions = { code: 'FORBIDDEN' };
        throw err;
      }
      if (!ACTIVE_STATUSES.includes(proposal.status)) {
        throw new Error(`Cannot withdraw a proposal that is already ${proposal.status}.`);
      }

      proposal.status = 'withdrawn';
      await proposal.save();
      return proposal;
    },

    shortlistProposal: async (_, { id }, context) => {
      const user = requireRole(context, ['client']);
      const proposal = await getOwnedJobProposal(id, user.id);
      if (proposal.status !== 'pending') {
        throw new Error(`Cannot shortlist a proposal that is ${proposal.status}.`);
      }
      proposal.status = 'shortlisted';
      await proposal.save();
      return proposal;
    },

    acceptProposal: async (_, { id }, context) => {
      const user = requireRole(context, ['client']);
      const proposal = await getOwnedJobProposal(id, user.id);
      if (!ACTIVE_STATUSES.includes(proposal.status)) {
        throw new Error(`Cannot accept a proposal that is ${proposal.status}.`);
      }

      proposal.status = 'accepted';
      await proposal.save();

      // Auto-reject every other active proposal on this job and close it.
      const otherActiveProposals = await Proposal.find({
        job: proposal.job._id,
        _id: { $ne: proposal._id },
        status: { $in: ACTIVE_STATUSES },
      });
      await Proposal.updateMany(
        { job: proposal.job._id, _id: { $ne: proposal._id }, status: { $in: ACTIVE_STATUSES } },
        { $set: { status: 'rejected' } }
      );
      await Job.findByIdAndUpdate(proposal.job._id, { status: 'closed' });

      createNotification({
        recipient: proposal.freelancer,
        type: 'proposal_accepted',
        title: 'Proposal accepted!',
        message: `Your proposal on "${proposal.job.title}" was accepted.`,
        link: `/jobs/${proposal.job._id}`,
        relatedId: proposal.job._id,
      }).catch((err) => console.error('Notification failed:', err.message));

      otherActiveProposals.forEach((p) => {
        createNotification({
          recipient: p.freelancer,
          type: 'proposal_rejected',
          title: 'Proposal update',
          message: `Your proposal on "${proposal.job.title}" was not selected.`,
          link: `/my-proposals`,
          relatedId: proposal.job._id,
        }).catch((err) => console.error('Notification failed:', err.message));
      });

      return proposal;
    },

    rejectProposal: async (_, { id }, context) => {
      const user = requireRole(context, ['client']);
      const proposal = await getOwnedJobProposal(id, user.id);
      if (!ACTIVE_STATUSES.includes(proposal.status)) {
        throw new Error(`Cannot reject a proposal that is ${proposal.status}.`);
      }
      proposal.status = 'rejected';
      await proposal.save();

      createNotification({
        recipient: proposal.freelancer,
        type: 'proposal_rejected',
        title: 'Proposal update',
        message: `Your proposal on "${proposal.job.title}" was not selected.`,
        link: `/my-proposals`,
        relatedId: proposal.job._id,
      }).catch((err) => console.error('Notification failed:', err.message));

      return proposal;
    },
  },

  Proposal: {
    id: (p) => p._id.toString(),
    job: (p) => (p.job._id ? p.job : Job.findById(p.job).exec()), // avoid a double-fetch if already populated
    freelancer: (p) => require('../../models/User').findById(p.freelancer).exec(),
    createdAt: (p) => p.createdAt.toISOString(),
    updatedAt: (p) => p.updatedAt.toISOString(),
  },
};