const Job = require('../../models/Job');
const Proposal = require('../../models/Proposal');
const User = require('../../models/User');
const Message = require('../../models/Message');
const Notification = require('../../models/Notification');
const { requireRole } = require('../../middleware/auth');

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

// Builds the last N months (oldest first) as { key: 'YYYY-M', month: 'Jan' } for
// zero-filling aggregation results so charts don't show gaps for quiet months.
const lastNMonths = (n = 6) => {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTH_LABELS[d.getMonth()] });
  }
  return months;
};

const zeroFillMonthly = (aggregated, months) => {
  // aggregated: Map of "YYYY-M" -> value
  return months.map(({ key, month }) => ({ month, value: aggregated.get(key) || 0 }));
};

const groupByMonth = (docs, dateField, valueFn = () => 1) => {
  const map = new Map();
  docs.forEach((doc) => {
    const d = new Date(doc[dateField]);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, (map.get(key) || 0) + valueFn(doc));
  });
  return map;
};

module.exports = {
  Query: {
    freelancerDashboard: async (_, __, context) => {
      const user = requireRole(context, ['freelancer']);
      const months = lastNMonths(6);

      const [myProposals, acceptedProposals, unreadMessages, unreadNotifications] =
        await Promise.all([
          Proposal.find({ freelancer: user.id }),
          Proposal.find({ freelancer: user.id, status: 'accepted' }).populate('job'),
          Message.countDocuments({ readBy: { $ne: user.id }, sender: { $ne: user.id } }),
          Notification.countDocuments({ recipient: user.id, isRead: false }),
        ]);

      const activeProjects = acceptedProposals.filter((p) => p.job.status === 'closed').length;
      const completedProjects = acceptedProposals.filter((p) => p.job.status === 'completed').length;
      const pendingProposals = myProposals.filter((p) =>
        ['pending', 'shortlisted'].includes(p.status)
      ).length;

      const totalEarnings = acceptedProposals
        .filter((p) => p.job.status === 'completed')
        .reduce((sum, p) => sum + p.proposedBudget, 0);

      const earningsByMonth = groupByMonth(
        acceptedProposals.filter((p) => p.job.status === 'completed'),
        'updatedAt',
        (p) => p.proposedBudget
      );

      const applicationsByMonth = groupByMonth(myProposals, 'createdAt');

      const decidedProposals = myProposals.filter((p) =>
        ['accepted', 'rejected'].includes(p.status)
      );
      const successRate = decidedProposals.length
        ? Math.round(
            (decidedProposals.filter((p) => p.status === 'accepted').length /
              decidedProposals.length) *
              1000
          ) / 10
        : 0;

      return {
        activeProjects,
        pendingProposals,
        completedProjects,
        totalEarnings,
        unreadMessages,
        unreadNotifications,
        successRate,
        monthlyEarnings: zeroFillMonthly(earningsByMonth, months),
        applicationsOverTime: zeroFillMonthly(applicationsByMonth, months),
      };
    },

    clientDashboard: async (_, __, context) => {
      const user = requireRole(context, ['client']);
      const months = lastNMonths(6);

      const jobs = await Job.find({ client: user.id });
      const jobIds = jobs.map((j) => j._id);
      const proposals = await Proposal.find({ job: { $in: jobIds } });

      const activeJobs = jobs.filter((j) => j.status === 'open').length;
      const completedProjects = jobs.filter((j) => j.status === 'completed').length;
      const hiredFreelancers = new Set(
        proposals.filter((p) => p.status === 'accepted').map((p) => p.freelancer.toString())
      ).size;
      const pendingProposals = proposals.filter((p) =>
        ['pending', 'shortlisted'].includes(p.status)
      ).length;

      const acceptedProposals = proposals.filter((p) => p.status === 'accepted');
      const completedJobIds = new Set(
        jobs.filter((j) => j.status === 'completed').map((j) => j._id.toString())
      );
      const spendingByMonth = groupByMonth(
        acceptedProposals.filter((p) => completedJobIds.has(p.job.toString())),
        'updatedAt',
        (p) => p.proposedBudget
      );

      const jobStatusCounts = ['open', 'closed', 'completed'].map((status) => ({
        status,
        count: jobs.filter((j) => j.status === status).length,
      }));

      const hiringCounts = ['accepted', 'rejected', 'pending', 'shortlisted', 'withdrawn']
        .map((status) => ({
          status,
          count: proposals.filter((p) => p.status === status).length,
        }))
        .filter((s) => s.count > 0);

      return {
        activeJobs,
        hiredFreelancers,
        pendingProposals,
        completedProjects,
        monthlySpending: zeroFillMonthly(spendingByMonth, months),
        jobStatusBreakdown: jobStatusCounts,
        hiringAnalytics: hiringCounts,
      };
    },

    adminDashboard: async (_, __, context) => {
      requireRole(context, ['admin']);
      const months = lastNMonths(6);

      const [users, jobs, proposals, acceptedProposals] = await Promise.all([
        User.find({}, 'createdAt role'),
        Job.find({}, 'createdAt status budget'),
        Proposal.find({}, 'createdAt freelancer'),
        Proposal.find({ status: 'accepted' }, 'proposedBudget'),
      ]);

      const totalUsers = users.length;
      const activeJobs = jobs.filter((j) => j.status === 'open').length;
      // Mock platform revenue: a flat 10% service fee on every accepted proposal.
      const revenue =
        Math.round(acceptedProposals.reduce((sum, p) => sum + p.proposedBudget * 0.1, 0) * 100) /
        100;
      const reportedUsers = await User.countDocuments({ reportCount: { $gt: 0 } });

      const userGrowth = groupByMonth(users, 'createdAt');
      const jobsPosted = groupByMonth(jobs, 'createdAt');
      const freelancerActivity = groupByMonth(proposals, 'createdAt');

      return {
        totalUsers,
        activeJobs,
        revenue,
        reportedUsers,
        userGrowth: zeroFillMonthly(userGrowth, months),
        jobsPosted: zeroFillMonthly(jobsPosted, months),
        freelancerActivity: zeroFillMonthly(freelancerActivity, months),
      };
    },
  },
};