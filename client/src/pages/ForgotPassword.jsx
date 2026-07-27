import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FORGOT_PASSWORD_MUTATION } from '../graphql/auth';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';

export default function ForgotPassword() {
  const [forgotPassword] = useMutation(FORGOT_PASSWORD_MUTATION);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      await forgotPassword({ variables: { email } });
      toast.success('If an account exists, a reset link has been sent.');
    } catch (err) {
      toast.error(err.message || 'Something went wrong');
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
    >
      {isSubmitSuccessful ? (
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Check your inbox for a password reset link. It expires in 1 hour.
        </p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Email" error={errors.email}>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              {...register('email', { required: 'Email is required' })}
            />
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}

      <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
        <Link to="/login" className="text-primary-600 hover:underline">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  );
}