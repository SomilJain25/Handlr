import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import {
  PROPOSALS_FOR_JOB_QUERY,
  SHORTLIST_PROPOSAL_MUTATION,
  ACCEPT_PROPOSAL_MUTATION,
  REJECT_PROPOSAL_MUTATION,
} from '../graphql/proposal';
import { START_CONVERSATION_MUTATION } from '../graphql/chat';

const STATUS_STYLE = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  shortlisted: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  accepted: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400',
  rejected: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  withdrawn: 'bg-gray-100 text-gray-500 dark:bg-gray-800',
};

export default function JobProposals() {
  const { id: jobId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(PROPOSALS_FOR_JOB_QUERY, {
    variables: { jobId },
  });

  const [shortlistProposal] = useMutation(SHORTLIST_PROPOSAL_MUTATION);
  const [acceptProposal] = useMutation(ACCEPT_PROPOSAL_MUTATION);
  const [rejectProposal] = useMutation(REJECT_PROPOSAL_MUTATION);
  const [startConversation] = useMutation(START_CONVERSATION_MUTATION);

  const handleMessage = async (freelancerId) => {
    try {
      const { data } = await startConversation({
        variables: { participantId: freelancerId, jobId },
      });
      navigate(`/messages/${data.startConversation.id}`);
    } catch (err) {
      toast.error(err.message || 'Could not start conversation');
    }
  };

  const runAction = async (mutationFn, id, successMsg) => {
    try {
      await mutationFn({ variables: { id } });
      toast.success(successMsg);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Action failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to={`/jobs/${jobId}`} className="text-sm text-primary-600 hover:underline">
        &larr; Back to job
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-6">Proposals</h1>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && (
        <p className="text-red-500 text-sm">
          Couldn't load proposals: {error.message}
        </p>
      )}
      {!loading && !error && data?.proposalsForJob.length === 0 && (
        <p className="text-gray-400 text-sm">No proposals yet.</p>
      )}

      <div className="space-y-4">
        {data?.proposalsForJob.map((p) => (
          <div
            key={p.id}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                {p.freelancer.profilePicture ? (
                  <img
                    src={p.freelancer.profilePicture}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800" />
                )}
                <div>
                  <div className="font-semibold">{p.freelancer.name}</div>
                  <div className="text-xs text-gray-400">
                    ${p.freelancer.hourlyRate ?? '—'}/hr · {(p.freelancer.skills || []).slice(0, 3).join(', ')}
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full capitalize ${STATUS_STYLE[p.status]}`}>
                {p.status}
              </span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{p.coverLetter}</p>
            <div className="text-xs text-gray-400 mb-3">
              Proposed ${p.proposedBudget.toLocaleString()} · {p.estimatedDuration}
            </div>

            {p.attachments?.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {p.attachments.map((a) => (
                  <a
                    key={a.url}
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary-600 hover:underline"
                  >
                    {a.name || 'Attachment'}
                  </a>
                ))}
              </div>
            )}

            {['pending', 'shortlisted'].includes(p.status) && (
              <div className="flex gap-2">
                {p.status === 'pending' && (
                  <button
                    onClick={() => runAction(shortlistProposal, p.id, 'Shortlisted')}
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Shortlist
                  </button>
                )}
                <button
                  onClick={() => handleMessage(p.freelancer.id)}
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Message
                </button>
                <button
                  onClick={() => runAction(acceptProposal, p.id, 'Proposal accepted — job closed')}
                  className="px-3 py-1.5 text-sm rounded-md bg-primary-500 text-white hover:bg-primary-600"
                >
                  Accept
                </button>
                <button
                  onClick={() => runAction(rejectProposal, p.id, 'Proposal rejected')}
                  className="px-3 py-1.5 text-sm rounded-md border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}