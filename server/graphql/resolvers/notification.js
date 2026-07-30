const Notification = require('../../models/Notification');
const { requireAuth } = require('../../middleware/auth');

module.exports = {
  Query: {
    notifications: async (_, { unreadOnly, limit = 20, offset = 0 }, context) => {
      const user = requireAuth(context);
      const query = { recipient: user.id };
      if (unreadOnly) query.isRead = false;

      return Notification.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit);
    },

    unreadNotificationCount: async (_, __, context) => {
      const user = requireAuth(context);
      return Notification.countDocuments({ recipient: user.id, isRead: false });
    },
  },

  Mutation: {
    markNotificationRead: async (_, { id }, context) => {
      const user = requireAuth(context);
      const notification = await Notification.findOne({ _id: id, recipient: user.id });
      if (!notification) throw new Error('Notification not found.');

      notification.isRead = true;
      await notification.save();
      return notification;
    },

    markAllNotificationsRead: async (_, __, context) => {
      const user = requireAuth(context);
      await Notification.updateMany(
        { recipient: user.id, isRead: false },
        { $set: { isRead: true } }
      );
      return true;
    },
  },

  Notification: {
    id: (n) => n._id.toString(),
    createdAt: (n) => n.createdAt.toISOString(),
  },
};