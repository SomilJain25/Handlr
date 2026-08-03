const Conversation = require('../../models/Conversation');
const Message = require('../../models/Message');
const User = require('../../models/User');
const { requireAuth } = require('../../middleware/auth');
const { getIO } = require('../../socket');
const { createNotification } = require('../../services/notificationService');

module.exports = {
  Query: {
    chats: async (_, __, context) => {
      const user = requireAuth(context);
      return Conversation.find({ participants: user.id }).sort({ lastMessageAt: -1 });
    },

    chat: async (_, { id }, context) => {
      const user = requireAuth(context);
      const conversation = await Conversation.findById(id);
      if (!conversation) return null;
      if (!conversation.participants.some((p) => p.toString() === user.id)) {
        const err = new Error('You are not part of this conversation.');
        err.extensions = { code: 'FORBIDDEN' };
        throw err;
      }
      return conversation;
    },

    messages: async (_, { conversationId, limit = 30, before }, context) => {
      const user = requireAuth(context);
      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some((p) => p.toString() === user.id)) {
        const err = new Error('You are not part of this conversation.');
        err.extensions = { code: 'FORBIDDEN' };
        throw err;
      }

      const query = { conversation: conversationId };
      if (before) query.createdAt = { $lt: new Date(before) };

      const messages = await Message.find(query).sort({ createdAt: -1 }).limit(limit);
      return messages.reverse(); // chronological order for the client
    },
  },

  Mutation: {
    startConversation: async (_, { participantId, jobId }, context) => {
      const user = requireAuth(context);
      if (participantId === user.id) {
        throw new Error('Cannot start a conversation with yourself.');
      }

      const otherUser = await User.findById(participantId);
      if (!otherUser) throw new Error('User not found.');

      let conversation = await Conversation.findOne({
        participants: { $all: [user.id, participantId], $size: 2 },
        ...(jobId ? { job: jobId } : {}),
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [user.id, participantId],
          job: jobId || undefined,
        });
      }

      return conversation;
    },

    sendMessage: async (_, { input }, context) => {
      const user = requireAuth(context);
      const { conversationId, content, attachments } = input;

      const conversation = await Conversation.findById(conversationId);
      if (!conversation || !conversation.participants.some((p) => p.toString() === user.id)) {
        const err = new Error('You are not part of this conversation.');
        err.extensions = { code: 'FORBIDDEN' };
        throw err;
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: user.id,
        content,
        attachments: attachments || [],
        readBy: [user.id],
      });

      conversation.lastMessage = content;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      // Broadcast to anyone with the Socket.io room open, so both transports stay in sync.
      const io = getIO();
      if (io) {
        io.to(conversationId).emit('newMessage', {
          id: message._id.toString(),
          conversationId,
          senderId: user.id,
          content,
          attachments: attachments || [],
          readBy: [user.id],
          createdAt: message.createdAt.toISOString(),
        });
      }

      const otherParticipantId = conversation.participants
        .map((p) => p.toString())
        .find((p) => p !== user.id);
      if (otherParticipantId) {
        createNotification({
          recipient: otherParticipantId,
          type: 'new_message',
          title: 'New message',
          message: content.length > 80 ? `${content.slice(0, 80)}…` : content,
          link: `/messages/${conversationId}`,
        }).catch((err) => console.error('Notification failed:', err.message));
      }

      return message;
    },
  },

  Conversation: {
    id: (c) => c._id.toString(),
    participants: (c) => User.find({ _id: { $in: c.participants } }).exec(),
    job: (c) => (c.job ? require('../../models/Job').findById(c.job).exec() : null),
    createdAt: (c) => c.createdAt.toISOString(),
    lastMessageAt: (c) => (c.lastMessageAt ? c.lastMessageAt.toISOString() : null),
    unreadCount: async (c, _, context) => {
      if (!context.user) return 0;
      return Message.countDocuments({
        conversation: c._id,
        readBy: { $ne: context.user.id },
        sender: { $ne: context.user.id },
      });
    },
  },

  Message: {
    id: (m) => m._id.toString(),
    conversationId: (m) => m.conversation.toString(),
    sender: (m) => User.findById(m.sender).exec(),
    createdAt: (m) => m.createdAt.toISOString(),
  },
};