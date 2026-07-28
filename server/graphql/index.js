const { mergeTypeDefs } = require('@graphql-tools/merge');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// --- typeDefs (add new files here as phases progress) ---
const authTypeDefs = require('./typeDefs/auth');
const profileTypeDefs = require('./typeDefs/profile');
// const jobTypeDefs = require('./typeDefs/job');           // Phase 4
// const proposalTypeDefs = require('./typeDefs/proposal'); // Phase 5
// const chatTypeDefs = require('./typeDefs/chat');         // Phase 6
// const reviewTypeDefs = require('./typeDefs/review');     // Phase 8

// --- resolvers (add new files here as phases progress) ---
const authResolvers = require('./resolvers/auth');
const profileResolvers = require('./resolvers/profile');
// const jobResolvers = require('./resolvers/job');
// const proposalResolvers = require('./resolvers/proposal');
// const chatResolvers = require('./resolvers/chat');
// const reviewResolvers = require('./resolvers/review');

const typeDefs = mergeTypeDefs([authTypeDefs, profileTypeDefs]);

const mergeResolvers = (resolverArr) => {
  const merged = { Query: {}, Mutation: {} };
  let hasSubscriptions = false;

  resolverArr.forEach((r) => {
    Object.assign(merged.Query, r.Query || {});
    Object.assign(merged.Mutation, r.Mutation || {});
    if (r.Subscription) {
      merged.Subscription = { ...(merged.Subscription || {}), ...r.Subscription };
      hasSubscriptions = true;
    }
  });

  // Only include the Subscription resolver map once a typeDef actually
  // declares a `type Subscription` (Phase 6+). An empty object here makes
  // graphql-tools throw "Subscription defined in resolvers, but not in schema".
  if (!hasSubscriptions) delete merged.Subscription;

  return merged;
};

const resolvers = mergeResolvers([authResolvers, profileResolvers]);

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { schema, typeDefs, resolvers };