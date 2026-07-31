const { gql } = require('graphql-tag');

module.exports = gql`
  extend type User {
    isSuspended: Boolean!
    reportCount: Int!
  }

  extend type Query {
    adminUsers(search: String, role: Role, limit: Int, offset: Int): [User!]!
    adminReviews(limit: Int, offset: Int): [Review!]!
  }

  extend type Mutation {
    suspendUser(id: ID!): User!
    unsuspendUser(id: ID!): User!
    reportUser(id: ID!, reason: String): Boolean!

    adminDeleteJob(id: ID!): Boolean!

    createCategory(name: String!): Category!
    deleteCategory(id: ID!): Boolean!

    deleteReview(id: ID!): Boolean!
  }
`;