import { gql } from '@apollo/client';

export const FREELANCER_DASHBOARD_QUERY = gql`
  query FreelancerDashboard {
    freelancerDashboard {
      activeProjects
      pendingProposals
      completedProjects
      totalEarnings
      unreadMessages
      unreadNotifications
      successRate
      monthlyEarnings {
        month
        value
      }
      applicationsOverTime {
        month
        value
      }
    }
  }
`;

export const CLIENT_DASHBOARD_QUERY = gql`
  query ClientDashboard {
    clientDashboard {
      activeJobs
      hiredFreelancers
      pendingProposals
      completedProjects
      monthlySpending {
        month
        value
      }
      jobStatusBreakdown {
        status
        count
      }
      hiringAnalytics {
        status
        count
      }
    }
  }
`;

export const ADMIN_DASHBOARD_QUERY = gql`
  query AdminDashboard {
    adminDashboard {
      totalUsers
      activeJobs
      revenue
      reportedUsers
      userGrowth {
        month
        value
      }
      jobsPosted {
        month
        value
      }
      freelancerActivity {
        month
        value
      }
    }
  }
`;