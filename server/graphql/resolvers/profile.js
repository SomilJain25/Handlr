const User = require('../../models/User');
const { requireAuth } = require('../../middleware/auth');

// Fields a freelancer is allowed to change about themselves.
const FREELANCER_FIELDS = [
  'name',
  'profilePicture',
  'bio',
  'skills',
  'hourlyRate',
  'availability',
  'resumeUrl',
  'portfolio',
  'github',
  'linkedin',
  'website',
];

// Fields a client is allowed to change about themselves.
const CLIENT_FIELDS = [
  'name',
  'profilePicture',
  'companyName',
  'companyLogo',
  'industry',
  'description',
  'website',
  'contactNumber',
];

const pickAllowed = (input, allowedFields) => {
  const update = {};
  for (const key of allowedFields) {
    if (input[key] !== undefined) update[key] = input[key];
  }
  return update;
};

module.exports = {
  Query: {
    freelancers: async (_, { search, skills, limit = 20, offset = 0 }) => {
      const query = { role: 'freelancer', isSuspended: false };

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } },
        ];
      }
      if (skills?.length) {
        query.skills = { $in: skills };
      }

      return User.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
    },

    clients: async (_, { search, limit = 20, offset = 0 }) => {
      const query = { role: 'client', isSuspended: false };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { companyName: { $regex: search, $options: 'i' } },
        ];
      }
      return User.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
    },

    user: async (_, { id }) => User.findById(id),
  },

  Mutation: {
    updateProfile: async (_, { input }, context) => {
      const authUser = requireAuth(context);
      const user = await User.findById(authUser.id);
      if (!user) throw new Error('User not found.');

      const allowedFields =
        user.role === 'freelancer' ? FREELANCER_FIELDS : CLIENT_FIELDS;

      const update = pickAllowed(input, allowedFields);
      Object.assign(user, update);
      await user.save();

      return user;
    },
  },
};