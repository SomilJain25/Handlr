import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  JOB_QUERY,
  DELETE_JOB_MUTATION,
  CLOSE_JOB_MUTATION,
  REOPEN_JOB_MUTATION,
} from '../graphql/job';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(JOB_QUERY, { variables: { id } });
  const [deleteJob] = useMutation(DELETE_JOB_MUTATION);
  const [closeJob] = useMutation(CLOSE_JOB_MUTATION);
  const [reopenJob] = useMutation(REOPEN_JOB_MUTATION);

  if (loading) return <div className="p-10 text-gray-400">Loading job…</div>;
  if (error || !data?.job)
    return <div className="p-10 text-red-500">Job not found.</div>;

  const job = data.job;
  const isOwner = user?.id === job.client.id;

  const handleDelete = async () => {
    if (!confirm('Delete this job posting? This cannot be undone.')) return;
    try {
      await deleteJob({ variables: { id } });
      toast.success('Job deleted');
      navigate('/jobs');
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const handleToggleStatus = async () => {
    try {
      if (job.status === 'open') {
        await closeJob({ variables: { id } });
        toast.success('Job closed');
      } else {
        await reopenJob({ variables: { id } });
        toast.success('Job reopened');
      }
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            job.status === 'open'
              ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400'
              : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
          }`}
        >
          {job.status}
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Posted by {job.client.companyName || job.client.name} · {job.category.name}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="text-gray-400">Budget</div>
          <div className="font-medium">${job.budget.toLocaleString()}</div>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="text-gray-400">Experience</div>
          <div className="font-medium capitalize">{job.experienceLevel}</div>
        </div>
        <div className="border border-gray-200 dark:border-gray-800 rounded-md p-3">
          <div className="text-gray-400">Location</div>
          <div className="font-medium capitalize">{job.locationType}</div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold mb-2">Description</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
          {job.description}
        </p>
      </div>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">Skills required</h2>
        <div className="flex flex-wrap gap-2">
          {job.skillsRequired.map((s) => (
            <span
              key={s}
              className="text-xs px-2 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {isOwner ? (
        <div className="flex flex-wrap gap-3">
          <Link
            to={`/jobs/${job.id}/edit`}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Edit
          </Link>
          <button
            onClick={handleToggleStatus}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {job.status === 'open' ? 'Close job' : 'Reopen job'}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md border border-red-300 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      ) : (
        user?.role === 'freelancer' &&
        job.status === 'open' && (
          <button className="px-5 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition">
            Submit a proposal
          </button>
        )
      )}
      {!isOwner && user?.role === 'freelancer' && job.status === 'open' && (
        <p className="text-xs text-gray-400 mt-2">
          Proposal submission arrives in Phase 5.
        </p>
      )}
    </div>
  );
}