import { gql } from '@apollo/client';

export const NOTIFICATIONS_QUERY = gql`
  query Notifications($unreadOnly: Boolean, $limit: Int, $offset: Int) {
    notifications(unreadOnly: $unreadOnly, limit: $limit, offset: $offset) {
      id
      type
      title
      message
      link
      isRead
      createdAt
    }
  }
`;

export const UNREAD_NOTIFICATION_COUNT_QUERY = gql`
  query UnreadNotificationCount {
    unreadNotificationCount
  }
`;

export const MARK_NOTIFICATION_READ_MUTATION = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationRead(id: $id) {
      id
      isRead
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_READ_MUTATION = gql`
  mutation MarkAllNotificationsRead {
    markAllNotificationsRead
  }
`;