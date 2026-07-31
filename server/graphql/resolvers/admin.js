const User = require('../../models/User');
const Job = require('../../models/Job');
const Category = require('../../models/Category');
const Review = require('../../models/Review');
const { requireAuth, requireRole } = require('../../middleware/auth');

const slugify = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

module.exports = {
  Query: {
    adminUsers: async (_, { search, role, limit = 25, offset = 0 }, context) => {
      requireRole(context, ['admin']);
      const query = {};
      if (role) query.role = role;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }
      return User.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
    },

    adminReviews: async (_, { limit = 25, offset = 0 }, context) => {
      requireRole(context, ['admin']);
      return Review.find().sort({ createdAt: -1 }).skip(offset).limit(limit);
    },
  },

  Mutation: {
    suspendUser: async (_, { id }, context) => {
      requireRole(context, ['admin']);
      const user = await User.findByIdAndUpdate(id, { isSuspended: true }, { new: true });
      if (!user) throw new Error('User not found.');
      return user;
    },

    unsuspendUser: async (_, { id }, context) => {
      requireRole(context, ['admin']);
      const user = await User.findByIdAndUpdate(id, { isSuspended: false }, { new: true });
      if (!user) throw new Error('User not found.');
      return user;
    },

    reportUser: async (_, { id }, context) => {
      const reporter = requireAuth(context);
      if (id === reporter.id) throw new Error('You cannot report yourself.');
      const user = await User.findByIdAndUpdate(id, { $inc: { reportCount: 1 } });
      if (!user) throw new Error('User not found.');
      return true;
    },

    adminDeleteJob: async (_, { id }, context) => {
      requireRole(context, ['admin']);
      const job = await Job.findByIdAndDelete(id);
      if (!job) throw new Error('Job not found.');
      return true;
    },

    createCategory: async (_, { name }, context) => {
      requireRole(context, ['admin']);
      const slug = slugify(name);
      const existing = await Category.findOne({ slug });
      if (existing) throw new Error('A category with this name already exists.');
      return Category.create({ name, slug });
    },

    deleteCategory: async (_, { id }, context) => {
      requireRole(context, ['admin']);
      const inUse = await Job.exists({ category: id });
      if (inUse) throw new Error('Cannot delete a category that has jobs posted under it.');
      const category = await Category.findByIdAndDelete(id);
      if (!category) throw new Error('Category not found.');
      return true;
    },

    deleteReview: async (_, { id }, context) => {
      requireRole(context, ['admin']);
      const review = await Review.findByIdAndDelete(id);
      if (!review) throw new Error('Review not found.');
      return true;
    },
  },
};