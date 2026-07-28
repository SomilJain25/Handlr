const { gql } = require('graphql-tag');

module.exports = gql`
  enum Availability {
    full_time
    part_time
    not_available
  }

  type PortfolioItem {
    title: String
    url: String
    image: String
  }

  extend type User {
    bio: String
    skills: [String!]
    hourlyRate: Float
    availability: Availability
    resumeUrl: String
    portfolio: [PortfolioItem!]
    github: String
    linkedin: String
    website: String

    companyName: String
    companyLogo: String
    industry: String
    description: String
    contactNumber: String
  }

  input PortfolioItemInput {
    title: String
    url: String
    image: String
  }

  input UpdateProfileInput {
    name: String
    profilePicture: String
    bio: String
    skills: [String!]
    hourlyRate: Float
    availability: Availability
    resumeUrl: String
    portfolio: [PortfolioItemInput!]
    github: String
    linkedin: String
    website: String

    companyName: String
    companyLogo: String
    industry: String
    description: String
    contactNumber: String
  }

  extend type Query {
    freelancers(search: String, skills: [String!], limit: Int, offset: Int): [User!]!
    clients(search: String, limit: Int, offset: Int): [User!]!
    user(id: ID!): User
  }

  extend type Mutation {
    updateProfile(input: UpdateProfileInput!): User!
  }
`;