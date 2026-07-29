import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { RESEND_VERIFICATION_MUTATION } from '../graphql/auth';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [resendVerification, { loading }] = useMutation(RESEND_VERIFICATION_MUTATION);

  const handleResend = async () => {
    try {
      await resendVerification();
      toast.success('Verification email sent — check your inbox.');
    } catch (err) {
      toast.error(err.message || 'Could not resend verification email');
    }
  };

  return (
    <div className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role} account</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          Log out
        </button>
      </div>

      {!user?.isVerified && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-700 px-4 py-3 text-sm flex items-center justify-between">
          <span>Your email isn't verified yet.</span>
          <button
            onClick={handleResend}
            disabled={loading}
            className="text-amber-700 dark:text-amber-400 font-medium hover:underline disabled:opacity-60"
          >
            {loading ? 'Sending…' : 'Resend email'}
          </button>
        </div>
      )}

      <p className="mt-8 text-sm text-gray-400">
        Full dashboard cards & charts (Phase 9) and role-specific tools (Phases 4–8) land here next.
      </p>

      <Link
        to={user?.role === 'freelancer' ? '/profile/freelancer' : '/profile/client'}
        className="inline-block mt-4 text-sm text-primary-600 hover:underline"
      >
        Edit my profile →
      </Link>
      <br />
      <Link to="/jobs" className="inline-block mt-2 text-sm text-primary-600 hover:underline">
        Browse jobs →
      </Link>
    </div>
  );
}