const { gql } = require('graphql-tag');

module.exports = gql`
  enum Role {
    freelancer
    client
    admin
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    profilePicture: String
    isVerified: Boolean!
    createdAt: String!
  }

  type AuthPayload {
    accessToken: String!
    refreshToken: String!
    user: User!
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: Role!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
    _health: String!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(token: String!): AuthPayload!
    logout: Boolean!

    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, newPassword: String!): Boolean!

    resendVerificationEmail: Boolean!
    verifyEmail(token: String!): Boolean!
  }
`;