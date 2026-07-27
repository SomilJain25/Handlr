const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/generateTokens');

// Track online users: userId -> Set of socket ids (supports multi-tab)
const onlineUsers = new Map();

const initSocket = (httpServer, clientUrl) => {
  const io = new Server(httpServer, {
    cors: { origin: clientUrl, credentials: true },
  });

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

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);
    io.emit('userOnline', { userId, online: true });

    // --- Placeholder events; Phase 6 will implement full chat logic ---
    socket.on('joinConversation', (conversationId) => {
      socket.join(conversationId);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      socket.to(conversationId).emit('typingStatus', { userId, isTyping });
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

module.exports = { initSocket, onlineUsers };
