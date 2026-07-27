const { mergeTypeDefs } = require('@graphql-tools/merge');
const { makeExecutableSchema } = require('@graphql-tools/schema');

// --- typeDefs (add new files here as phases progress) ---
const authTypeDefs = require('./typeDefs/auth');
// const jobTypeDefs = require('./typeDefs/job');           // Phase 4
// const proposalTypeDefs = require('./typeDefs/proposal'); // Phase 5
// const chatTypeDefs = require('./typeDefs/chat');         // Phase 6
// const reviewTypeDefs = require('./typeDefs/review');     // Phase 8

// --- resolvers (add new files here as phases progress) ---
const authResolvers = require('./resolvers/auth');
// const jobResolvers = require('./resolvers/job');
// const proposalResolvers = require('./resolvers/proposal');
// const chatResolvers = require('./resolvers/chat');
// const reviewResolvers = require('./resolvers/review');

const typeDefs = mergeTypeDefs([authTypeDefs]);

const mergeResolvers = (resolverArr) => {
  const merged = { Query: {}, Mutation: {}}; //, Subscription: {} 
  resolverArr.forEach((r) => {
    Object.assign(merged.Query, r.Query || {});
    Object.assign(merged.Mutation, r.Mutation || {});
    // Object.assign(merged.Subscription, r.Subscription || {});
  });
  return merged;
};

const resolvers = mergeResolvers([authResolvers]);

const schema = makeExecutableSchema({ typeDefs, resolvers });

module.exports = { schema, typeDefs, resolvers };
