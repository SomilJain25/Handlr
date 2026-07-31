const { gql } = require('graphql-tag');

module.exports = gql`
  type Review {
    id: ID!
    job: Job!
    reviewer: User!
    reviewee: User!
    rating: Int!
    feedback: String!
    createdAt: String!
  }

  extend type User {
    averageRating: Float
    reviewCount: Int!
  }

  input CreateReviewInput {
    jobId: ID!
    revieweeId: ID!
    rating: Int!
    feedback: String!
  }

  extend type Query {
    reviews(userId: ID!, limit: Int, offset: Int): [Review!]!
    reviewsForJob(jobId: ID!): [Review!]!
  }

  extend type Mutation {
    # Client marks a closed job's work as approved/finished — required before either
    # party can leave a review (mirrors the spec's "Approve work" client capability).
    completeJob(id: ID!): Job!
    createReview(input: CreateReviewInput!): Review!
  }
`;