import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { MY_PROPOSALS_QUERY, WITHDRAW_PROPOSAL_MUTATION } from '../graphql/proposal';

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  shortlisted: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  withdrawn: 'bg-gray-100 text-gray-500 dark:bg-gray-800',
};

export default function MyProposals() {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, loading, refetch } = useQuery(MY_PROPOSALS_QUERY, {
    variables: { status: statusFilter || undefined },
  });
  const [withdrawProposal] = useMutation(WITHDRAW_PROPOSAL_MUTATION);

  const handleWithdraw = async (id) => {
    if (!confirm('Withdraw this proposal?')) return;
    try {
      await withdrawProposal({ variables: { id } });
      toast.success('Proposal withdrawn');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not withdraw');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My proposals</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
        </select>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {!loading && data?.myProposals.length === 0 && (
        <p className="text-gray-400 text-sm">You haven't submitted any proposals yet.</p>
      )}

      <div className="space-y-4">
        {data?.myProposals.map((p) => (
          <div
            key={p.id}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <Link to={`/jobs/${p.job.id}`} className="font-semibold hover:underline">
                {p.job.title}
              </Link>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_STYLE[p.status]}`}>
                {p.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
              {p.coverLetter}
            </p>
            <div className="text-xs text-gray-400 mb-3">
              Proposed ${p.proposedBudget.toLocaleString()} · {p.estimatedDuration}
            </div>
            {['pending', 'shortlisted'].includes(p.status) && (
              <button
                onClick={() => handleWithdraw(p.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Withdraw
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}