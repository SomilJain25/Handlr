import { gql } from '@apollo/client';

export const PROPOSAL_FIELDS = gql`
  fragment ProposalFields on Proposal {
    id
    coverLetter
    proposedBudget
    estimatedDuration
    status
    createdAt
    attachments {
      name
      url
    }
    freelancer {
      id
      name
      profilePicture
      skills
      hourlyRate
    }
    job {
      id
      title
      budget
      status
    }
  }
`;

export const APPLY_JOB_MUTATION = gql`
  ${PROPOSAL_FIELDS}
  mutation ApplyJob($jobId: ID!, $input: ApplyJobInput!) {
    applyJob(jobId: $jobId, input: $input) {
      ...ProposalFields
    }
  }
`;

export const MY_PROPOSALS_QUERY = gql`
  ${PROPOSAL_FIELDS}
  query MyProposals($status: ProposalStatus) {
    myProposals(status: $status) {
      ...ProposalFields
    }
  }
`;

export const PROPOSALS_FOR_JOB_QUERY = gql`
  ${PROPOSAL_FIELDS}
  query ProposalsForJob($jobId: ID!, $status: ProposalStatus) {
    proposalsForJob(jobId: $jobId, status: $status) {
      ...ProposalFields
    }
  }
`;

export const WITHDRAW_PROPOSAL_MUTATION = gql`
  mutation WithdrawProposal($id: ID!) {
    withdrawProposal(id: $id) {
      id
      status
    }
  }
`;

export const SHORTLIST_PROPOSAL_MUTATION = gql`
  mutation ShortlistProposal($id: ID!) {
    shortlistProposal(id: $id) {
      id
      status
    }
  }
`;

export const ACCEPT_PROPOSAL_MUTATION = gql`
  mutation AcceptProposal($id: ID!) {
    acceptProposal(id: $id) {
      id
      status
      job {
        id
        status
      }
    }
  }
`;

export const REJECT_PROPOSAL_MUTATION = gql`
  mutation RejectProposal($id: ID!) {
    rejectProposal(id: $id) {
      id
      status
    }
  }
`;