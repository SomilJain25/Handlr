import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  NOTIFICATIONS_QUERY,
  UNREAD_NOTIFICATION_COUNT_QUERY,
  MARK_NOTIFICATION_READ_MUTATION,
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
} from '../graphql/notification';
import { getSocket } from '../services/socket';

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const { data: countData, refetch: refetchCount } = useQuery(
    UNREAD_NOTIFICATION_COUNT_QUERY,
    { pollInterval: 30000 }
  );
  const { data: listData, refetch: refetchList } = useQuery(NOTIFICATIONS_QUERY, {
    variables: { limit: 8 },
    skip: !open,
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ_MUTATION);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ_MUTATION);

  // Live updates: toast immediately + refresh the badge/list.
  useEffect(() => {
    const socket = getSocket();
    const handleNewNotification = (notif) => {
      toast(notif.title, { icon: '🔔' });
      refetchCount();
      if (open) refetchList();
    };
    socket.on('newNotification', handleNewNotification);
    return () => socket.off('newNotification', handleNewNotification);
  }, [open, refetchCount, refetchList]);

  // Close dropdown on outside click.
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markRead({ variables: { id: notif.id } });
        refetchCount();
      } catch {
        // non-fatal
      }
    }
    setOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      refetchCount();
      refetchList();
    } catch (err) {
      toast.error(err.message || 'Could not mark all as read');
    }
  };

  const unreadCount = countData?.unreadNotificationCount || 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 text-[10px] bg-primary-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
            <span className="font-semibold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll} className="text-xs text-primary-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          {listData?.notifications.length === 0 && (
            <p className="px-4 py-6 text-sm text-gray-400 text-center">No notifications yet.</p>
          )}

          {listData?.notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`w-full text-left px-4 py-3 border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                !n.isRead ? 'bg-primary-50/50 dark:bg-primary-500/5' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">{n.title}</span>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-primary-500 mt-1 shrink-0" />}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
              <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
            </button>
          ))}

          <button
            onClick={() => {
              setOpen(false);
              navigate('/notifications');
            }}
            className="w-full text-center text-xs text-primary-600 hover:underline py-2"
          >
            See all
          </button>
        </div>
      )}
    </div>
  );
}