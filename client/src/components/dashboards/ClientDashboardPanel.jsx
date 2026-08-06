import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { CLIENT_DASHBOARD_QUERY } from '../../graphql/dashboard';
import DashboardCard from '../DashboardCard';
import MiniBarChart from '../MiniBarChart';

export default function ClientDashboardPanel() {
  const { data, loading, error } = useQuery(CLIENT_DASHBOARD_QUERY);

  if (loading) return <p className="text-gray-400 text-sm">Loading dashboard…</p>;
  if (error) return <p className="text-red-500 text-sm">Couldn't load your dashboard: {error.message}</p>;
  const d = data?.clientDashboard;
  if (!d) return null;

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <DashboardCard label="Active Jobs" value={d.activeJobs} />
        <DashboardCard label="Hired Freelancers" value={d.hiredFreelancers} />
        <DashboardCard label="Pending Proposals" value={d.pendingProposals} />
        <DashboardCard label="Completed Projects" value={d.completedProjects} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniBarChart title="Monthly spending" data={d.monthlySpending} valuePrefix="$" />
        <MiniBarChart
          title="Job status breakdown"
          data={d.jobStatusBreakdown}
          labelKey="status"
          valueKey="count"
        />
        <MiniBarChart
          title="Hiring analytics"
          data={d.hiringAnalytics}
          labelKey="status"
          valueKey="count"
        />
      </div>

      <div className="flex gap-4 mt-6 text-sm">
        <Link to="/jobs/new" className="text-primary-600 hover:underline">
          Post a job →
        </Link>
        <Link to="/jobs" className="text-primary-600 hover:underline">
          Browse jobs →
        </Link>
      </div>
    </div>
  );
}