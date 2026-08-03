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

/**
 * Browsers reject an Access-Control-Allow-Origin header that isn't a full
 * origin (scheme + host) - if CLIENT_URL is set to e.g. "myapp.vercel.app"
 * instead of "https://myapp.vercel.app", cors() would echo that invalid
 * value straight into the header and every cross-origin request fails with
 * a CORS error that looks nothing like the actual misconfiguration. Normalize
 * it here so a missing scheme or trailing slash doesn't quietly break CORS.
 */
const normalizeOrigin = (url) => {
  const withScheme = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return withScheme.replace(/\/+$/, ''); // strip trailing slash(es)
};

/**
 * CLIENT_URL accepts a comma-separated list, since a single Vercel project
 * commonly has multiple stable domains that all need to work (the custom
 * alias plus the git-branch alias) - a single hardcoded origin can only ever
 * match one of them. Vercel's ephemeral per-deployment hash URLs (the ones
 * that change on every single push, e.g. handlr-l8vcaxllr-....vercel.app)
 * are intentionally NOT meant to be added here - test against the stable
 * domains instead.
 */
const ALLOWED_ORIGINS = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

console.log('[config] Allowed CORS origins:', ALLOWED_ORIGINS.join(', '));

const corsOptions = {
  origin(origin, callback) {
    // No origin header = same-origin request, curl, server-to-server, etc. - allow it.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    callback(new Error(`Origin "${origin}" is not in the CLIENT_URL allowlist.`));
  },
  credentials: true,
};

async function startServer() {
  await connectDB();

  const app = express();
  const httpServer = http.createServer(app);

  // --- Security & core middleware ---
  app.use(helmet());
  app.use(cors(corsOptions));
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

  // --- Socket.io (init before Apollo so resolvers can broadcast via getIO()) ---
  const io = initSocket(httpServer, ALLOWED_ORIGINS);

  // --- Apollo Server (GraphQL) ---
  const apolloServer = new ApolloServer({ schema });
  await apolloServer.start();

  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({
        user: getUserFromReq(req),
        io,
      }),
    })
  );

  // --- Health check ---
  app.get('/', (req, res) => res.json({ status: 'Handlr API is running' }));

  // --- 404 handler ---
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  httpServer.listen(PORT, () => {
    console.log(`Handlr API ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});