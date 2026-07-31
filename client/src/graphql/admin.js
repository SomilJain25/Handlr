import { gql } from '@apollo/client';

export const ADMIN_USERS_QUERY = gql`
  query AdminUsers($search: String, $role: Role, $limit: Int, $offset: Int) {
    adminUsers(search: $search, role: $role, limit: $limit, offset: $offset) {
      id
      name
      email
      role
      isVerified
      isSuspended
      reportCount
      createdAt
    }
  }
`;

export const ADMIN_REVIEWS_QUERY = gql`
  query AdminReviews($limit: Int, $offset: Int) {
    adminReviews(limit: $limit, offset: $offset) {
      id
      rating
      feedback
      createdAt
      reviewer {
        id
        name
      }
      reviewee {
        id
        name
      }
      job {
        id
        title
      }
    }
  }
`;

export const CATEGORIES_ADMIN_QUERY = gql`
  query CategoriesAdmin {
    categories {
      id
      name
      slug
    }
  }
`;

export const SUSPEND_USER_MUTATION = gql`
  mutation SuspendUser($id: ID!) {
    suspendUser(id: $id) {
      id
      isSuspended
    }
  }
`;

export const UNSUSPEND_USER_MUTATION = gql`
  mutation UnsuspendUser($id: ID!) {
    unsuspendUser(id: $id) {
      id
      isSuspended
    }
  }
`;

export const ADMIN_DELETE_JOB_MUTATION = gql`
  mutation AdminDeleteJob($id: ID!) {
    adminDeleteJob(id: $id)
  }
`;

export const CREATE_CATEGORY_MUTATION = gql`
  mutation CreateCategory($name: String!) {
    createCategory(name: $name) {
      id
      name
      slug
    }
  }
`;

export const DELETE_CATEGORY_MUTATION = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;

export const DELETE_REVIEW_MUTATION = gql`
  mutation DeleteReview($id: ID!) {
    deleteReview(id: $id)
  }
`;

export const REPORT_USER_MUTATION = gql`
  mutation ReportUser($id: ID!, $reason: String) {
    reportUser(id: $id, reason: $reason)
  }
`;