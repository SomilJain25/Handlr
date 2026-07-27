import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { RESET_PASSWORD_MUTATION } from '../graphql/auth';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [resetPassword] = useMutation(RESET_PASSWORD_MUTATION);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('newPassword');

  const onSubmit = async ({ newPassword }) => {
    if (!token) {
      toast.error('Missing or invalid reset token.');
      return;
    }
    try {
      await resetPassword({ variables: { token, newPassword } });
      toast.success('Password updated. Please log in.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Reset failed');
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          This password reset link is missing its token. Please request a new one.
        </p>
        <Link to="/forgot-password" className="text-primary-600 hover:underline text-sm">
          Request a new link
        </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="New password" error={errors.newPassword}>
          <input
            type="password"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('newPassword', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
          />
        </FormField>

        <FormField label="Confirm new password" error={errors.confirmPassword}>
          <input
            type="password"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('confirmPassword', {
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
        >
          {isSubmitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  );
}