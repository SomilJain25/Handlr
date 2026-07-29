const { mergeTypeDefs } = require('@graphql-tools/merge');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// --- typeDefs (add new files here as phases progress) ---
const authTypeDefs = require('./typeDefs/auth');
const profileTypeDefs = require('./typeDefs/profile');
const jobTypeDefs = require('./typeDefs/job');
const proposalTypeDefs = require('./typeDefs/proposal');
// const chatTypeDefs = require('./typeDefs/chat');         // Phase 6
// const reviewTypeDefs = require('./typeDefs/review');     // Phase 8

// --- resolvers (add new files here as phases progress) ---
const authResolvers = require('./resolvers/auth');
const profileResolvers = require('./resolvers/profile');
const jobResolvers = require('./resolvers/job');
const proposalResolvers = require('./resolvers/proposal');
// const chatResolvers = require('./resolvers/chat');
// const reviewResolvers = require('./resolvers/review');

const typeDefs = mergeTypeDefs([authTypeDefs, profileTypeDefs, jobTypeDefs, proposalTypeDefs]);

const mergeResolvers = (resolverArr) => {
  const merged = {};

  resolverArr.forEach((r) => {
    Object.entries(r).forEach(([typeName, fieldMap]) => {
      merged[typeName] = { ...(merged[typeName] || {}), ...fieldMap };
    });
  });

  // graphql-tools throws if a Subscription resolver map exists but no
  // `type Subscription` has been declared yet (pre-Phase 6).
  if (merged.Subscription && Object.keys(merged.Subscription).length === 0) {
    delete merged.Subscription;
  }

  return merged;
};

const resolvers = mergeResolvers([authResolvers, profileResolvers, jobResolvers, proposalResolvers]);

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { schema, typeDefs, resolvers };