# Handlr — Freelance Marketplace for Tech Professionals

Full-stack: React + Vite + Tailwind (client) · Express + Apollo Server GraphQL + Socket.io (server) · MongoDB Atlas.

## ✅ Phase 1 — Project Scaffolding (done)

What's included:
- Server: Express + Apollo Server 4 wired together, MongoDB connection, security middleware
  (Helmet, CORS, rate limiting, Mongo sanitize), Socket.io bootstrap with JWT handshake auth,
  base `User` model, minimal working `register` / `login` / `refreshToken` / `logout` / `me`
  resolvers so the app is runnable end-to-end today.
- Client: Vite + React + Tailwind (dark-mode ready) + Apollo Client (with auth header link) +
  React Router + Auth context + toast notifications + a Home page that live-checks the API
  connection via a `_health` query.

## How to run Phase 1

**1. Server**
```bash
cd server
cp .env.example .env     # then fill in MONGO_URI, JWT secrets, Cloudinary keys
npm install
npm run dev               # http://localhost:5000/graphql
```

**2. Client**
```bash
cd client
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Open the client — you should see "API connected ✓" on the home page once both are running
and `MONGO_URI` points to a real Atlas cluster (register/login will 500 until you set that up,
but the health check only needs the DB connection, not auth).

## Roadmap

- [x] **Phase 1** — Scaffolding, DB connection, GraphQL/Socket.io bootstrap
- [ ] **Phase 2** — Full auth (refresh rotation, email verification, forgot/reset password), protected routes on client
- [ ] **Phase 3** — Freelancer & Client profile CRUD + Cloudinary uploads
- [ ] **Phase 4** — Jobs & Categories (CRUD, search/filter/pagination)
- [ ] **Phase 5** — Proposals workflow
- [ ] **Phase 6** — Real-time chat (Socket.io): typing, online users, read receipts
- [ ] **Phase 7** — Notifications (GraphQL subscriptions + toasts)
- [ ] **Phase 8** — Reviews & ratings
- [ ] **Phase 9** — Dashboards (Freelancer/Client/Admin) + charts + admin moderation
- [ ] **Phase 10** — UI polish, PWA, error pages, deployment (Vercel/Render)

## Folder structure

```
handlr/
  server/
    config/        # db.js, cloudinary.js
    graphql/
      typeDefs/     # one file per domain (auth.js so far)
      resolvers/    # one file per domain (auth.js so far)
      index.js      # merges all typeDefs/resolvers into one schema
    middleware/     # auth.js (JWT context + guards)
    models/         # User.js (Job, Proposal, etc. arrive in later phases)
    socket/         # Socket.io bootstrap
    utils/          # generateTokens.js
    server.js       # entry point
  client/
    src/
      graphql/      # Apollo Client setup
      context/      # AuthContext
      pages/        # Home, NotFound (more each phase)
      routes/       # AppRoutes.jsx
      App.jsx / main.jsx
```

## Notes for the next phase

To add a new domain (e.g. Jobs in Phase 4):
1. Create `server/models/Job.js`
2. Create `server/graphql/typeDefs/job.js` and `server/graphql/resolvers/job.js`
3. Import and merge them in `server/graphql/index.js` (commented placeholders are already there)
4. Add client pages under `client/src/pages/` and routes in `AppRoutes.jsx`

No changes to `server.js` are needed for new domains — it reads the merged schema from
`graphql/index.js` automatically.
