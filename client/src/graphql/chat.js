import { gql } from '@apollo/client';

export const CHATS_QUERY = gql`
  query Chats {
    chats {
      id
      lastMessage
      lastMessageAt
      unreadCount
      participants {
        id
        name
        profilePicture
      }
      job {
        id
        title
      }
    }
  }
`;

export const MESSAGES_QUERY = gql`
  query Messages($conversationId: ID!, $limit: Int, $before: String) {
    messages(conversationId: $conversationId, limit: $limit, before: $before) {
      id
      conversationId
      content
      createdAt
      readBy
      attachments {
        name
        url
      }
      sender {
        id
        name
        profilePicture
      }
    }
  }
`;

export const START_CONVERSATION_MUTATION = gql`
  mutation StartConversation($participantId: ID!, $jobId: ID) {
    startConversation(participantId: $participantId, jobId: $jobId) {
      id
      participants {
        id
        name
        profilePicture
      }
    }
  }
`;