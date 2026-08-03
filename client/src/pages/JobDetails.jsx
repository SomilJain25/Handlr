import { useState } from 'react';
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
import { MY_PROPOSALS_QUERY } from '../graphql/proposal';
import { START_CONVERSATION_MUTATION } from '../graphql/chat';
import { COMPLETE_JOB_MUTATION, REVIEWS_FOR_JOB_QUERY } from '../graphql/review';
import ProposalModal from '../components/ProposalModal';
import ReviewModal from '../components/ReviewModal';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { data, loading, error } = useQuery(JOB_QUERY, { variables: { id } });
  const [deleteJob] = useMutation(DELETE_JOB_MUTATION);
  const [closeJob] = useMutation(CLOSE_JOB_MUTATION);
  const [reopenJob] = useMutation(REOPEN_JOB_MUTATION);
  const [startConversation] = useMutation(START_CONVERSATION_MUTATION);
  const [completeJob] = useMutation(COMPLETE_JOB_MUTATION);

  const { data: reviewsData, refetch: refetchReviews } = useQuery(REVIEWS_FOR_JOB_QUERY, {
    variables: { jobId: id },
    skip: !data?.job || data.job.status !== 'completed',
  });

  // Check whether this freelancer already has an active proposal on this job.
  // network-only + tracking `loading` matters here: this check gates whether
  // the Submit button is even clickable, so a stale/incomplete answer can let
  // someone attempt (and get rejected for) a duplicate submission.
  const { data: myProposalsData, loading: myProposalsLoading } = useQuery(MY_PROPOSALS_QUERY, {
    skip: user?.role !== 'freelancer',
    fetchPolicy: 'network-only',
  });

  if (loading) return <div className="p-10 text-gray-400">Loading job…</div>;
  if (error || !data?.job)
    return <div className="p-10 text-red-500">Job not found.</div>;

  const job = data.job;
  const isOwner = user?.id === job.client.id;
  const existingProposal = myProposalsData?.myProposals.find(
    (p) => p.job.id === job.id && ['pending', 'shortlisted', 'accepted'].includes(p.status)
  );

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

  const handleMessageClient = async () => {
    try {
      const { data } = await startConversation({
        variables: { participantId: job.client.id, jobId: job.id },
      });
      navigate(`/messages/${data.startConversation.id}`);
    } catch (err) {
      toast.error(err.message || 'Could not start conversation');
    }
  };

  const handleCompleteJob = async () => {
    if (!confirm('Mark this job as complete? Both sides will be able to leave a review.')) return;
    try {
      await completeJob({ variables: { id } });
      toast.success('Job marked complete');
    } catch (err) {
      toast.error(err.message || 'Could not mark complete');
    }
  };

  // Who the current user would be reviewing, if eligible.
  const revieweeId = isOwner ? job.hiredFreelancer?.id : existingProposal?.status === 'accepted' ? job.client.id : null;
  const revieweeName = isOwner ? job.hiredFreelancer?.name : job.client.name;
  const myReview = reviewsData?.reviewsForJob.find((r) => r.reviewer.id === user?.id);

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
          <Link
            to={`/jobs/${job.id}/proposals`}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            View proposals ({job.proposalCount})
          </Link>
          {job.status !== 'completed' && (
            <button
              onClick={handleToggleStatus}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {job.status === 'open' ? 'Close job' : 'Reopen job'}
            </button>
          )}
          {job.status === 'closed' && job.hiredFreelancer && (
            <button
              onClick={handleCompleteJob}
              className="px-4 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600"
            >
              Mark complete
            </button>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md border border-red-300 text-red-500 text-sm hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            Delete
          </button>
        </div>
      ) : (
        user?.role === 'freelancer' && (
          <>
            <button
              onClick={handleMessageClient}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 mb-3"
            >
              Message client
            </button>
            <br />
            {myProposalsLoading ? (
              <p className="text-sm text-gray-400">Checking your application status…</p>
            ) : existingProposal ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You already applied to this job — status:{' '}
                <span className="font-medium capitalize">{existingProposal.status}</span>
              </p>
            ) : job.status === 'open' ? (
              <button
                onClick={() => setShowProposalModal(true)}
                className="px-5 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition"
              >
                Submit a proposal
              </button>
            ) : (
              <p className="text-sm text-gray-400">This job is no longer accepting proposals.</p>
            )}
          </>
        )
      )}

      {showProposalModal && (
        <ProposalModal
          jobId={job.id}
          onClose={() => setShowProposalModal(false)}
        />
      )}

      {job.status === 'completed' && (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Reviews</h2>
            {revieweeId && !myReview && (
              <button
                onClick={() => setShowReviewModal(true)}
                className="text-sm text-primary-600 hover:underline"
              >
                Leave a review
              </button>
            )}
          </div>

          {reviewsData?.reviewsForJob.length === 0 && (
            <p className="text-sm text-gray-400">No reviews yet.</p>
          )}

          <div className="space-y-3">
            {reviewsData?.reviewsForJob.map((r) => (
              <div key={r.id} className="border border-gray-200 dark:border-gray-800 rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{r.reviewer.name}</span>
                  <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReviewModal && revieweeId && (
        <ReviewModal
          jobId={job.id}
          revieweeId={revieweeId}
          revieweeName={revieweeName}
          onClose={() => setShowReviewModal(false)}
          onSubmitted={refetchReviews}
        />
      )}
    </div>
  );
}