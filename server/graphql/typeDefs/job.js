const { gql } = require('graphql-tag');

module.exports = gql`
  enum ExperienceLevel {
    entry
    intermediate
    expert
  }

  enum LocationType {
    remote
    hybrid
    onsite
  }

  enum JobStatus {
    open
    closed
  }

  type Category {
    id: ID!
    name: String!
    slug: String!
  }

  type Job {
    id: ID!
    title: String!
    description: String!
    budget: Float!
    deadline: String
    skillsRequired: [String!]!
    experienceLevel: ExperienceLevel!
    category: Category!
    locationType: LocationType!
    status: JobStatus!
    client: User!
    proposalCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type JobPage {
    jobs: [Job!]!
    total: Int!
    hasMore: Boolean!
  }

  input CreateJobInput {
    title: String!
    description: String!
    budget: Float!
    deadline: String
    skillsRequired: [String!]
    experienceLevel: ExperienceLevel
    categoryId: ID!
    locationType: LocationType
  }

  input UpdateJobInput {
    title: String
    description: String
    budget: Float
    deadline: String
    skillsRequired: [String!]
    experienceLevel: ExperienceLevel
    categoryId: ID
    locationType: LocationType
  }

  input JobFilterInput {
    search: String
    categoryId: ID
    skills: [String!]
    minBudget: Float
    maxBudget: Float
    experienceLevel: ExperienceLevel
    locationType: LocationType
    status: JobStatus
    clientId: ID
  }

  enum JobSort {
    NEWEST
    OLDEST
    BUDGET_HIGH
    BUDGET_LOW
  }

  extend type Query {
    jobs(
      filter: JobFilterInput
      sort: JobSort
      limit: Int
      offset: Int
    ): JobPage!
    job(id: ID!): Job
    categories: [Category!]!
  }

  extend type Mutation {
    createJob(input: CreateJobInput!): Job!
    updateJob(id: ID!, input: UpdateJobInput!): Job!
    deleteJob(id: ID!): Boolean!
    closeJob(id: ID!): Job!
    reopenJob(id: ID!): Job!
  }
`;