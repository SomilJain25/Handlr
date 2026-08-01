import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CHATS_QUERY } from '../graphql/chat';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data } = useQuery(CHATS_QUERY, { skip: !user, pollInterval: 15000 });
  const unreadTotal = data?.chats.reduce((sum, c) => sum + c.unreadCount, 0) || 0;

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold text-lg">
            Handlr
          </Link>
          <Link
            to="/jobs"
            className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600"
          >
            Jobs
          </Link>
          {user && (
            <Link
              to="/messages"
              className="hidden sm:inline text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600 relative"
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

        {/* Desktop controls */}
        <div className="hidden sm:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="text-sm text-gray-500 hover:text-primary-600"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link to="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary-600">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">
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

        {/* Mobile hamburger */}
        <div className="flex sm:hidden items-center gap-3">
          {user && <NotificationBell />}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            className="text-xl leading-none"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="sm:hidden mt-3 pb-2 flex flex-col gap-3 text-sm">
          <Link to="/jobs" onClick={() => setMobileOpen(false)} className="text-gray-600 dark:text-gray-300">
            Jobs
          </Link>
          {user && (
            <Link to="/messages" onClick={() => setMobileOpen(false)} className="text-gray-600 dark:text-gray-300">
              Messages {unreadTotal > 0 && `(${unreadTotal})`}
            </Link>
          )}
          <button onClick={toggleTheme} className="text-left text-gray-600 dark:text-gray-300">
            {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
          </button>
          {user ? (
            <>
              <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-gray-600 dark:text-gray-300">
                Dashboard
              </Link>
              <button onClick={handleLogout} className="text-left text-red-500">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)} className="text-gray-600 dark:text-gray-300">
                Log in
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="text-primary-600 font-medium">
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}