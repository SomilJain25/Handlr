import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  NOTIFICATIONS_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from '../graphql/notification';

const TYPE_ICON = {
  new_proposal: '📄',
  proposal_accepted: '✅',
  proposal_rejected: '❌',
  new_message: '💬',
  new_review: '⭐',
  project_completed: '🎉',
};

function formatDate(iso) {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Notifications() {
  const navigate = useNavigate();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data, loading, error, refetch } = useQuery(NOTIFICATIONS_QUERY, {
    variables: { unreadOnly, limit: 50 },
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION);

  const handleClick = async (n) => {
    if (!n.isRead) {
      try {
        await markRead({ variables: { id: n.id } });
        refetch();
      } catch {
        // non-fatal
      }
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      refetch();
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error(err.message || 'Could not mark all as read');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="accent-primary-500"
            />
            Unread only
          </label>
          <button onClick={handleMarkAll} className="text-sm text-primary-600 hover:underline">
            Mark all read
          </button>
        </div>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading…</p>}
      {error && (
        <p className="text-red-500 text-sm">Couldn't load notifications: {error.message}</p>
      )}
      {!loading && !error && data?.notifications.length === 0 && (
        <p className="text-gray-400 text-sm">Nothing here yet.</p>
      )}

      <div className="space-y-2">
        {data?.notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => handleClick(n)}
            className={`w-full text-left border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-start gap-3 hover:border-primary-300 dark:hover:border-primary-600 transition ${
              !n.isRead ? 'bg-primary-50/40 dark:bg-primary-500/5' : ''
            }`}
          >
            <span className="text-xl leading-none">{TYPE_ICON[n.type] || '🔔'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm">{n.title}</span>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(n.createdAt)}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{n.message}</p>
            </div>
            {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}