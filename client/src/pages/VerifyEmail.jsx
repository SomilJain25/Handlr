import { useEffect, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useSearchParams, Link } from 'react-router-dom';
import { VERIFY_EMAIL_MUTATION } from '../graphql/auth';
import AuthLayout from '../layouts/AuthLayout';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [verifyEmail] = useMutation(VERIFY_EMAIL_MUTATION);
  const [status, setStatus] = useState('verifying'); // verifying | success | error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    verifyEmail({ variables: { token } })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthLayout title="Email verification">
      {status === 'verifying' && (
        <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your email…</p>
      )}
      {status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">
          Your email has been verified. You're all set.
        </p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-500">
          This verification link is invalid or has expired.
        </p>
      )}
      <Link to="/" className="mt-6 inline-block text-sm text-primary-600 hover:underline">
        Back to Handlr
      </Link>
    </AuthLayout>
  );
}