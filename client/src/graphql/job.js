import { gql } from '@apollo/client';

export const JOB_CARD_FIELDS = gql`
  fragment JobCardFields on Job {
    id
    title
    description
    budget
    deadline
    skillsRequired
    experienceLevel
    locationType
    status
    proposalCount
    createdAt
    category {
      id
      name
    }
    client {
      id
      name
      companyName
      profilePicture
    }
    hiredFreelancer {
      id
      name
      profilePicture
    }
  }
`;

export const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      id
      name
      slug
    }
  }
`;

export const JOBS_QUERY = gql`
  ${JOB_CARD_FIELDS}
  query Jobs($filter: JobFilterInput, $sort: JobSort, $limit: Int, $offset: Int) {
    jobs(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      total
      hasMore
      jobs {
        ...JobCardFields
      }
    }
  }
`;

export const JOB_QUERY = gql`
  ${JOB_CARD_FIELDS}
  query Job($id: ID!) {
    job(id: $id) {
      ...JobCardFields
    }
  }
`;

export const CREATE_JOB_MUTATION = gql`
  ${JOB_CARD_FIELDS}
  mutation CreateJob($input: CreateJobInput!) {
    createJob(input: $input) {
      ...JobCardFields
    }
  }
`;

export const UPDATE_JOB_MUTATION = gql`
  ${JOB_CARD_FIELDS}
  mutation UpdateJob($id: ID!, $input: UpdateJobInput!) {
    updateJob(id: $id, input: $input) {
      ...JobCardFields
    }
  }
`;

export const DELETE_JOB_MUTATION = gql`
  mutation DeleteJob($id: ID!) {
    deleteJob(id: $id)
  }
`;

export const CLOSE_JOB_MUTATION = gql`
  mutation CloseJob($id: ID!) {
    closeJob(id: $id) {
      id
      status
    }
  }
`;

export const REOPEN_JOB_MUTATION = gql`
  mutation ReopenJob($id: ID!) {
    reopenJob(id: $id) {
      id
      status
    }
  }
`;