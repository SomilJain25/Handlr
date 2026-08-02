import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CHATS_QUERY } from '../graphql/chat';
import NotificationBell from './NotificationBell';

function LogoMark() {
  return (
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
      <svg
        className="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
        />
      </svg>
    </div>
  );
}

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
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-ink/80 border-b border-gray-200/70 dark:border-gray-800/50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
            <LogoMark />
            Handlr
          </Link>
          <Link
            to="/jobs"
            className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Jobs
          </Link>
          {user && (
            <Link
              to="/messages"
              className="hidden sm:inline text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition relative"
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
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700/60 flex items-center justify-center transition"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {user && <NotificationBell />}
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-red-500 transition"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-primary-500 text-white shadow-glow hover:bg-primary-400 hover:shadow-glow-lg hover:-translate-y-0.5 transition"
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
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-lg leading-none"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="sm:hidden px-6 pb-4 flex flex-col gap-3 text-sm border-t border-gray-200/70 dark:border-gray-800/50 pt-3">
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
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="text-primary-500 font-semibold"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}