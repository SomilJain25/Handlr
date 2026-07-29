const mongoose = require('mongoose');
const Job = require('../../models/Job');
const Category = require('../../models/Category');
const { requireRole } = require('../../middleware/auth');

const SORT_MAP = {
  NEWEST: { createdAt: -1 },
  OLDEST: { createdAt: 1 },
  BUDGET_HIGH: { budget: -1 },
  BUDGET_LOW: { budget: 1 },
};

const buildFilterQuery = (filter = {}) => {
  const query = {};

  if (filter.search) {
    query.$text = { $search: filter.search };
  }
  if (filter.categoryId) query.category = filter.categoryId;
  if (filter.skills?.length) query.skillsRequired = { $in: filter.skills };
  if (filter.experienceLevel) query.experienceLevel = filter.experienceLevel;
  if (filter.locationType) query.locationType = filter.locationType;
  if (filter.clientId) query.client = filter.clientId;
  query.status = filter.status || 'open'; // default to open jobs only

  if (filter.minBudget != null || filter.maxBudget != null) {
    query.budget = {};
    if (filter.minBudget != null) query.budget.$gte = filter.minBudget;
    if (filter.maxBudget != null) query.budget.$lte = filter.maxBudget;
  }

  return query;
};

const assertOwnsJob = async (jobId, userId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found.');
  if (job.client.toString() !== userId) {
    const err = new Error('You do not own this job.');
    err.extensions = { code: 'FORBIDDEN' };
    throw err;
  }
  return job;
};

module.exports = {
  Query: {
    jobs: async (_, { filter, sort, limit = 20, offset = 0 }) => {
      const query = buildFilterQuery(filter);
      const sortOption = SORT_MAP[sort] || SORT_MAP.NEWEST;

      const [jobs, total] = await Promise.all([
        Job.find(query).sort(sortOption).skip(offset).limit(limit),
        Job.countDocuments(query),
      ]);

      return { jobs, total, hasMore: offset + jobs.length < total };
    },

    job: async (_, { id }) => {
      if (!mongoose.isValidObjectId(id)) return null;
      return Job.findById(id);
    },

    categories: async () => Category.find().sort({ name: 1 }),
  },

  Mutation: {
    createJob: async (_, { input }, context) => {
      const user = requireRole(context, ['client']);

      const category = await Category.findById(input.categoryId);
      if (!category) throw new Error('Invalid category.');

      const job = await Job.create({
        title: input.title,
        description: input.description,
        budget: input.budget,
        deadline: input.deadline,
        skillsRequired: input.skillsRequired || [],
        experienceLevel: input.experienceLevel || 'intermediate',
        category: category._id,
        locationType: input.locationType || 'remote',
        client: user.id,
      });

      return job;
    },

    updateJob: async (_, { id, input }, context) => {
      const user = requireRole(context, ['client']);
      const job = await assertOwnsJob(id, user.id);

      if (input.categoryId) {
        const category = await Category.findById(input.categoryId);
        if (!category) throw new Error('Invalid category.');
        job.category = category._id;
      }

      const fields = [
        'title',
        'description',
        'budget',
        'deadline',
        'skillsRequired',
        'experienceLevel',
        'locationType',
      ];
      fields.forEach((f) => {
        if (input[f] !== undefined) job[f] = input[f];
      });

      await job.save();
      return job;
    },

    deleteJob: async (_, { id }, context) => {
      const user = requireRole(context, ['client']);
      await assertOwnsJob(id, user.id);
      await Job.findByIdAndDelete(id);
      return true;
    },

    closeJob: async (_, { id }, context) => {
      const user = requireRole(context, ['client']);
      const job = await assertOwnsJob(id, user.id);
      job.status = 'closed';
      await job.save();
      return job;
    },

    reopenJob: async (_, { id }, context) => {
      const user = requireRole(context, ['client']);
      const job = await assertOwnsJob(id, user.id);
      job.status = 'open';
      await job.save();
      return job;
    },
  },

  Job: {
    id: (job) => job._id.toString(),
    category: (job) => Category.findById(job.category),
    client: (job) => require('../../models/User').findById(job.client),
    deadline: (job) => (job.deadline ? job.deadline.toISOString() : null),
    createdAt: (job) => job.createdAt.toISOString(),
    updatedAt: (job) => job.updatedAt.toISOString(),
  },

  Category: {
    id: (cat) => cat._id.toString(),
  },
};