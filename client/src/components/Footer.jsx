import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { user } = useAuth();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800/50 mt-16">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight mb-3">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"
                  />
                </svg>
              </div>
              Handlr
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-500 leading-relaxed">
              The freelance marketplace built exclusively for tech professionals.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">For Clients</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
              <li>
                <Link to={user ? '/jobs/new' : '/register'} className="hover:text-gray-900 dark:hover:text-white transition">
                  Post a job
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-gray-900 dark:hover:text-white transition">
                  Browse talent's work
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">For Freelancers</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
              <li>
                <Link to="/jobs" className="hover:text-gray-900 dark:hover:text-white transition">
                  Find jobs
                </Link>
              </li>
              <li>
                <Link to={user ? '/my-proposals' : '/register'} className="hover:text-gray-900 dark:hover:text-white transition">
                  My proposals
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Account</h4>
            <ul className="space-y-3 text-sm text-gray-500 dark:text-gray-500">
              {user ? (
                <li>
                  <Link to="/dashboard" className="hover:text-gray-900 dark:hover:text-white transition">
                    Dashboard
                  </Link>
                </li>
              ) : (
                <>
                  <li>
                    <Link to="/login" className="hover:text-gray-900 dark:hover:text-white transition">
                      Log in
                    </Link>
                  </li>
                  <li>
                    <Link to="/register" className="hover:text-gray-900 dark:hover:text-white transition">
                      Sign up
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800/50 pt-6 text-sm text-gray-400 dark:text-gray-600">
          © {new Date().getFullYear()} Handlr. Built as a full-stack portfolio project.
        </div>
      </div>
    </footer>
  );
}