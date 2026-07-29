const { gql } = require('graphql-tag');

module.exports = gql`
  type MessageAttachment {
    name: String
    url: String
  }

  type Message {
    id: ID!
    conversationId: ID!
    sender: User!
    content: String!
    attachments: [MessageAttachment!]!
    readBy: [ID!]!
    createdAt: String!
  }

  type Conversation {
    id: ID!
    participants: [User!]!
    job: Job
    lastMessage: String
    lastMessageAt: String
    unreadCount: Int!
    createdAt: String!
  }

  input SendMessageInput {
    conversationId: ID!
    content: String!
    attachments: [AttachmentInput!]
  }

  extend type Query {
    chats: [Conversation!]!
    chat(id: ID!): Conversation
    messages(conversationId: ID!, limit: Int, before: String): [Message!]!
  }

  extend type Mutation {
    startConversation(participantId: ID!, jobId: ID): Conversation!
    sendMessage(input: SendMessageInput!): Message!
  }
`;