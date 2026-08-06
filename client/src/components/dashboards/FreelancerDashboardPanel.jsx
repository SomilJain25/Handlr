import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { FREELANCER_DASHBOARD_QUERY } from '../../graphql/dashboard';
import DashboardCard from '../DashboardCard';
import MiniBarChart from '../MiniBarChart';

export default function FreelancerDashboardPanel() {
  const { data, loading, error } = useQuery(FREELANCER_DASHBOARD_QUERY);

  if (loading) return <p className="text-gray-400 text-sm">Loading dashboard…</p>;
  if (error) return <p className="text-red-500 text-sm">Couldn't load your dashboard: {error.message}</p>;
  const d = data?.freelancerDashboard;
  if (!d) return null;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <DashboardCard label="Active Projects" value={d.activeProjects} />
        <DashboardCard label="Pending Proposals" value={d.pendingProposals} />
        <DashboardCard label="Completed Projects" value={d.completedProjects} />
        <DashboardCard label="Total Earnings" value={`$${d.totalEarnings.toLocaleString()}`} />
        <DashboardCard label="Unread Messages" value={d.unreadMessages} />
        <DashboardCard label="Unread Notifications" value={d.unreadNotifications} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniBarChart title="Monthly earnings" data={d.monthlyEarnings} valuePrefix="$" />
        <MiniBarChart title="Applications over time" data={d.applicationsOverTime} />
        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex flex-col items-center justify-center">
          <div className="text-sm font-semibold mb-2">Success rate</div>
          <div className="text-3xl font-bold text-primary-600">{d.successRate}%</div>
          <p className="text-xs text-gray-400 mt-1">of decided proposals accepted</p>
        </div>
      </div>

      <div className="flex gap-4 mt-6 text-sm">
        <Link to="/jobs" className="text-primary-600 hover:underline">
          Browse jobs →
        </Link>
        <Link to="/my-proposals" className="text-primary-600 hover:underline">
          My proposals →
        </Link>
      </div>
    </div>
  );
}