const { gql } = require('graphql-tag');

module.exports = gql`
  enum ProposalStatus {
    pending
    shortlisted
    accepted
    rejected
    withdrawn
  }

  type Attachment {
    name: String
    url: String
  }

  type Proposal {
    id: ID!
    job: Job!
    freelancer: User!
    coverLetter: String!
    proposedBudget: Float!
    estimatedDuration: String!
    attachments: [Attachment!]!
    status: ProposalStatus!
    createdAt: String!
    updatedAt: String!
  }

  input AttachmentInput {
    name: String
    url: String
  }

  input ApplyJobInput {
    coverLetter: String!
    proposedBudget: Float!
    estimatedDuration: String!
    attachments: [AttachmentInput!]
  }

  extend type Query {
    # Proposals for a specific job (client viewing applicants for their own job)
    proposalsForJob(jobId: ID!, status: ProposalStatus): [Proposal!]!
    # A freelancer's own submitted proposals
    myProposals(status: ProposalStatus): [Proposal!]!
    proposal(id: ID!): Proposal
  }

  extend type Mutation {
    applyJob(jobId: ID!, input: ApplyJobInput!): Proposal!
    withdrawProposal(id: ID!): Proposal!
    shortlistProposal(id: ID!): Proposal!
    acceptProposal(id: ID!): Proposal!
    rejectProposal(id: ID!): Proposal!
  }
`;