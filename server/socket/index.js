const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/generateTokens');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Track online users: userId -> Set of socket ids (supports multi-tab/device)
const onlineUsers = new Map();

let ioInstance = null;
const getIO = () => ioInstance;

const initSocket = (httpServer, clientUrl) => {
  const io = new Server(httpServer, {
    cors: { origin: clientUrl, credentials: true },
  });
  ioInstance = io;

  // Auth middleware for socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication token missing.'));
    try {
      const decoded = verifyAccessToken(token);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Invalid or expired token.'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId } = socket.user;

    // Personal room for targeted events like notifications (io.to(userId).emit(...)).
    socket.join(userId);

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit('userOnline', { userId, online: true });

    // --- Join a conversation room (client calls this after opening a chat) ---
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('leaveConversation', (conversationId) => {
      socket.leave(conversationId);
    });

    // --- Send a message: persist then broadcast to the room ---
    socket.on('sendMessage', async ({ conversationId, content, attachments = [] }, ack) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some((p) => p.toString() === userId)) {
          return ack?.({ error: 'Not a participant in this conversation.' });
        }

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          content,
          attachments,
          readBy: [userId],
        });

        conversation.lastMessage = content;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        const payload = {
          id: message._id.toString(),
          conversationId,
          senderId: userId,
          content,
          attachments,
          readBy: [userId],
          createdAt: message.createdAt.toISOString(),
        };

        io.to(conversationId).emit('newMessage', payload);
        ack?.({ message: payload });

        // Notify the other participant (lazy require avoids a require-cycle
        // with notificationService, which itself imports getIO from this file).
        const otherParticipantId = conversation.participants
          .map((p) => p.toString())
          .find((p) => p !== userId);
        if (otherParticipantId) {
          const { createNotification } = require('../services/notificationService');
          createNotification({
            recipient: otherParticipantId,
            type: 'new_message',
            title: 'New message',
            message: content.length > 80 ? `${content.slice(0, 80)}…` : content,
            link: `/messages/${conversationId}`,
            relatedId: conversationId,
          }).catch((err) => console.error('Notification failed:', err.message));
        }
      } catch (err) {
        console.error('sendMessage error:', err.message);
        ack?.({ error: 'Could not send message.' });
      }
    });

    // --- Typing indicator ---
    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typingStatus', { userId, isTyping });
    });

    // --- Read receipts: mark all messages in a conversation as read by this user ---
    socket.on('markAsRead', async ({ conversationId }) => {
      try {
        await Message.updateMany(
          { conversation: conversationId, readBy: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        io.to(conversationId).emit('messagesSeen', { conversationId, userId });
      } catch (err) {
        console.error('markAsRead error:', err.message);
      }
    });

    socket.on('disconnect', () => {
      const sockets = onlineUsers.get(userId);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('userOnline', { userId, online: false });
        }
      }
    });
  });

  return io;
};

module.exports = { initSocket, getIO, onlineUsers };