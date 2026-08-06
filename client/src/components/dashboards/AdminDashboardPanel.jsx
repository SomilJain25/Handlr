import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { ADMIN_DASHBOARD_QUERY } from '../../graphql/dashboard';
import {
  ADMIN_USERS_QUERY,
  ADMIN_REVIEWS_QUERY,
  CATEGORIES_ADMIN_QUERY,
  SUSPEND_USER_MUTATION,
  UNSUSPEND_USER_MUTATION,
  CREATE_CATEGORY_MUTATION,
  DELETE_CATEGORY_MUTATION,
  DELETE_REVIEW_MUTATION,
} from '../../graphql/admin';
import DashboardCard from '../DashboardCard';
import MiniBarChart from '../MiniBarChart';

export default function AdminDashboardPanel() {
  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(ADMIN_DASHBOARD_QUERY);
  const [tab, setTab] = useState('users');

  const d = statsData?.adminDashboard;

  return (
    <div>
      {statsLoading && <p className="text-gray-400 text-sm mb-4">Loading stats…</p>}
      {statsError && (
        <p className="text-red-500 text-sm mb-4">Couldn't load stats: {statsError.message}</p>
      )}
      {d && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <DashboardCard label="Total Users" value={d.totalUsers} />
            <DashboardCard label="Active Jobs" value={d.activeJobs} />
            <DashboardCard label="Revenue (mock)" value={`$${d.revenue.toLocaleString()}`} />
            <DashboardCard label="Reported Users" value={d.reportedUsers} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <MiniBarChart title="User growth" data={d.userGrowth} />
            <MiniBarChart title="Jobs posted" data={d.jobsPosted} />
            <MiniBarChart title="Freelancer activity" data={d.freelancerActivity} />
          </div>
        </>
      )}

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 mb-4">
        {['users', 'categories', 'reviews'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 text-sm capitalize border-b-2 ${
              tab === t
                ? 'border-primary-500 text-primary-600 font-medium'
                : 'border-transparent text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'users' && <UsersTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'reviews' && <ReviewsTab />}
    </div>
  );
}

function UsersTab() {
  const [search, setSearch] = useState('');
  const { data, loading, error, refetch } = useQuery(ADMIN_USERS_QUERY, {
    variables: { search: search || undefined, limit: 50 },
  });
  const [suspendUser] = useMutation(SUSPEND_USER_MUTATION);
  const [unsuspendUser] = useMutation(UNSUSPEND_USER_MUTATION);

  const toggleSuspend = async (u) => {
    try {
      if (u.isSuspended) {
        await unsuspendUser({ variables: { id: u.id } });
        toast.success(`${u.name} unsuspended`);
      } else {
        await suspendUser({ variables: { id: u.id } });
        toast.success(`${u.name} suspended`);
      }
      refetch();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div>
      <input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
      />
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-500 text-sm">Couldn't load users: {error.message}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-200 dark:border-gray-800">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Role</th>
              <th className="py-2 pr-4">Reports</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data?.adminUsers.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-900">
                <td className="py-2 pr-4">{u.name}</td>
                <td className="py-2 pr-4 text-gray-500">{u.email}</td>
                <td className="py-2 pr-4 capitalize">{u.role}</td>
                <td className="py-2 pr-4">{u.reportCount > 0 ? u.reportCount : '—'}</td>
                <td className="py-2 pr-4">
                  {u.isSuspended ? (
                    <span className="text-red-500">Suspended</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </td>
                <td className="py-2">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => toggleSuspend(u)}
                      className="text-xs text-primary-600 hover:underline"
                    >
                      {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const { data, loading, error, refetch } = useQuery(CATEGORIES_ADMIN_QUERY);
  const [name, setName] = useState('');
  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY_MUTATION);
  const [deleteCategory] = useMutation(DELETE_CATEGORY_MUTATION);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await createCategory({ variables: { name: name.trim() } });
      setName('');
      refetch();
      toast.success('Category added');
    } catch (err) {
      toast.error(err.message || 'Could not create category');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await deleteCategory({ variables: { id } });
      refetch();
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.message || 'Could not delete category');
    }
  };

  return (
    <div>
      <form onSubmit={handleCreate} className="flex gap-2 mb-4 max-w-sm">
        <input
          placeholder="New category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={creating}
          className="px-3 py-2 rounded-md bg-primary-500 text-white text-sm hover:bg-primary-600 disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-500 text-sm">Couldn't load categories: {error.message}</p>}
      <div className="flex flex-wrap gap-2">
        {data?.categories.map((c) => (
          <span
            key={c.id}
            className="text-sm px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center gap-2"
          >
            {c.name}
            <button
              onClick={() => handleDelete(c.id)}
              className="text-gray-400 hover:text-red-500"
              aria-label={`Delete ${c.name}`}
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ReviewsTab() {
  const { data, loading, error, refetch } = useQuery(ADMIN_REVIEWS_QUERY, {
    variables: { limit: 50 },
  });
  const [deleteReview] = useMutation(DELETE_REVIEW_MUTATION);

  const handleDelete = async (id) => {
    if (!confirm('Remove this review? This cannot be undone.')) return;
    try {
      await deleteReview({ variables: { id } });
      refetch();
      toast.success('Review removed');
    } catch (err) {
      toast.error(err.message || 'Could not remove review');
    }
  };

  return (
    <div className="space-y-3">
      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && <p className="text-red-500 text-sm">Couldn't load reviews: {error.message}</p>}
      {!loading && !error && data?.adminReviews.length === 0 && (
        <p className="text-gray-400 text-sm">No reviews yet.</p>
      )}
      {data?.adminReviews.map((r) => (
        <div key={r.id} className="border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              {r.reviewer.name} → {r.reviewee.name}{' '}
              <span className="text-gray-400 font-normal">on {r.job.title}</span>
            </span>
            <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{r.feedback}</p>
          <button onClick={() => handleDelete(r.id)} className="text-xs text-red-500 hover:underline">
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}