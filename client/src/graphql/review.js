import { gql } from '@apollo/client';

export const REVIEWS_QUERY = gql`
  query Reviews($userId: ID!, $limit: Int, $offset: Int) {
    reviews(userId: $userId, limit: $limit, offset: $offset) {
      id
      rating
      feedback
      createdAt
      reviewer {
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

export const REVIEWS_FOR_JOB_QUERY = gql`
  query ReviewsForJob($jobId: ID!) {
    reviewsForJob(jobId: $jobId) {
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
    }
  }
`;

export const COMPLETE_JOB_MUTATION = gql`
  mutation CompleteJob($id: ID!) {
    completeJob(id: $id) {
      id
      status
    }
  }
`;

export const CREATE_REVIEW_MUTATION = gql`
  mutation CreateReview($input: CreateReviewInput!) {
    createReview(input: $input) {
      id
      rating
      feedback
    }
  }
`;