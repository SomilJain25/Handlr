const { gql } = require('graphql-tag');

module.exports = gql`
  type MonthlyDataPoint {
    month: String!
    value: Float!
  }

  type StatusCount {
    status: String!
    count: Int!
  }

  type FreelancerDashboard {
    activeProjects: Int!
    pendingProposals: Int!
    completedProjects: Int!
    totalEarnings: Float!
    unreadMessages: Int!
    unreadNotifications: Int!
    successRate: Float!
    monthlyEarnings: [MonthlyDataPoint!]!
    applicationsOverTime: [MonthlyDataPoint!]!
  }

  type ClientDashboard {
    activeJobs: Int!
    hiredFreelancers: Int!
    pendingProposals: Int!
    completedProjects: Int!
    monthlySpending: [MonthlyDataPoint!]!
    jobStatusBreakdown: [StatusCount!]!
    hiringAnalytics: [StatusCount!]!
  }

  type AdminDashboard {
    totalUsers: Int!
    activeJobs: Int!
    revenue: Float!
    reportedUsers: Int!
    userGrowth: [MonthlyDataPoint!]!
    jobsPosted: [MonthlyDataPoint!]!
    freelancerActivity: [MonthlyDataPoint!]!
  }

  extend type Query {
    freelancerDashboard: FreelancerDashboard!
    clientDashboard: ClientDashboard!
    adminDashboard: AdminDashboard!
  }
`;