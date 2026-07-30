const Notification = require('../models/Notification');
const { getIO } = require('../socket');

/**
 * Creates a notification and, if the recipient has a live socket connection,
 * pushes it immediately via their personal room (io.to(recipientId)).
 */
const createNotification = async ({ recipient, type, title, message, link, relatedId }) => {
  const notification = await Notification.create({
    recipient,
    type,
    title,
    message,
    link,
    relatedId,
  });

  const io = getIO();
  if (io) {
    io.to(recipient.toString()).emit('newNotification', {
      id: notification._id.toString(),
      type,
      title,
      message,
      link,
      relatedId: relatedId ? relatedId.toString() : null,
      isRead: false,
      createdAt: notification.createdAt.toISOString(),
    });
  }

  return notification;
};

module.exports = { createNotification };