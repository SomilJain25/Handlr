require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');

const connectDB = require('./config/db');
const { schema } = require('./graphql');
const { getUserFromReq } = require('./middleware/auth');
const { initSocket } = require('./socket');
const uploadRoutes = require('./routes/uploadRoutes');

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

async function startServer() {
  await connectDB();

  const app = express();
  const httpServer = http.createServer(app);

  // --- Security & core middleware ---
  app.use(helmet());
  app.use(cors({ origin: CLIENT_URL, credentials: true }));
  app.use(express.json());
  app.use(mongoSanitize()); // MongoDB operator injection protection
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/graphql', limiter);

  // --- Static file serving for local uploads (falls back before Cloudinary is configured) ---
  app.use('/uploads', express.static('uploads'));

  // --- REST upload routes (Cloudinary) ---
  app.use('/api/upload', uploadRoutes);

  // --- Apollo Server (GraphQL) ---
  const apolloServer = new ApolloServer({ schema });
  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        user: getUserFromReq(req),
      }),
    })
  );

  // --- Health check ---
  app.get('/', (req, res) => res.json({ status: 'Handlr API is running' }));

  // --- 404 handler ---
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // --- Socket.io ---
  initSocket(httpServer, CLIENT_URL);

  httpServer.listen(PORT, () => {
    console.log(`Handlr API ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});