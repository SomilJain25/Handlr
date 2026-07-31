import { useState } from 'react';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { CREATE_REVIEW_MUTATION, REVIEWS_FOR_JOB_QUERY } from '../graphql/review';
import StarRating from './StarRating';

export default function ReviewModal({ jobId, revieweeId, revieweeName, onClose, onSubmitted }) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [createReview, { loading }] = useMutation(CREATE_REVIEW_MUTATION, {
    refetchQueries: [{ query: REVIEWS_FOR_JOB_QUERY, variables: { jobId } }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) {
      toast.error('Please add some feedback.');
      return;
    }
    try {
      await createReview({
        variables: { input: { jobId, revieweeId, rating, feedback } },
      });
      toast.success('Review submitted');
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not submit review');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Review {revieweeName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Rating
            </label>
            <StarRating value={rating} onChange={setRating} />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Feedback
            </label>
            <textarea
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              placeholder="How was your experience working together?"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
          >
            {loading ? 'Submitting…' : 'Submit review'}
          </button>
        </form>
      </div>
    </div>
  );
}