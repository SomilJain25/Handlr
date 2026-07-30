const { gql } = require('graphql-tag');

module.exports = gql`
  enum NotificationType {
    new_proposal
    proposal_accepted
    proposal_rejected
    new_message
    new_review
    project_completed
  }

  type Notification {
    id: ID!
    type: NotificationType!
    title: String!
    message: String!
    link: String
    relatedId: ID
    isRead: Boolean!
    createdAt: String!
  }

  extend type Query {
    notifications(unreadOnly: Boolean, limit: Int, offset: Int): [Notification!]!
    unreadNotificationCount: Int!
  }

  extend type Mutation {
    markNotificationRead(id: ID!): Notification!
    markAllNotificationsRead: Boolean!
  }
`;