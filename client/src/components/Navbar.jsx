import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { CHATS_QUERY } from '../graphql/chat';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery(CHATS_QUERY, { skip: !user, pollInterval: 15000 });
  const unreadTotal = data?.chats.reduce((sum, c) => sum + c.unreadCount, 0) || 0;

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link to="/" className="font-bold text-lg">
          Handlr
        </Link>
        <Link to="/jobs" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600">
          Jobs
        </Link>
        {user && (
          <Link
            to="/messages"
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 relative"
          >
            Messages
            {unreadTotal > 0 && (
              <span className="absolute -top-2 -right-3 text-[10px] bg-primary-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {unreadTotal > 9 ? '9+' : unreadTotal}
              </span>
            )}
          </Link>
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600">
              Dashboard
            </Link>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="text-sm text-gray-500 hover:text-red-500"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600">
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm px-3 py-1.5 rounded-md bg-primary-500 text-white hover:bg-primary-600"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}