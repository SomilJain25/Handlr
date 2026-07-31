import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { RESEND_VERIFICATION_MUTATION } from '../graphql/auth';
import FreelancerDashboardPanel from '../components/dashboards/FreelancerDashboardPanel';
import ClientDashboardPanel from '../components/dashboards/ClientDashboardPanel';
import AdminDashboardPanel from '../components/dashboards/AdminDashboardPanel';

export default function Dashboard() {
  const { user } = useAuth();
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
    <div className="min-h-screen px-6 py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role} account</p>
        </div>
        {user?.role !== 'admin' && (
          <Link
            to={user?.role === 'freelancer' ? '/profile/freelancer' : '/profile/client'}
            className="text-sm text-primary-600 hover:underline"
          >
            Edit my profile →
          </Link>
        )}
      </div>

      {!user?.isVerified && user?.role !== 'admin' && (
        <div className="rounded-md bg-amber-50 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-700 px-4 py-3 text-sm flex items-center justify-between mb-6">
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

      {user?.role === 'freelancer' && <FreelancerDashboardPanel />}
      {user?.role === 'client' && <ClientDashboardPanel />}
      {user?.role === 'admin' && <AdminDashboardPanel />}
    </div>
  );
}