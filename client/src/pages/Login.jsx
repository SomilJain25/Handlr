import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await login(values.email, values.password);
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <AuthLayout title="Log in to Handlr" subtitle="Hire talent or find your next project.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="Email" error={errors.email}>
          <input
            type="email"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('email', { required: 'Email is required' })}
          />
        </FormField>

        <FormField label="Password" error={errors.password}>
          <input
            type="password"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('password', { required: 'Password is required' })}
          />
        </FormField>

        <div className="flex justify-end mb-4">
          <Link to="/forgot-password" className="text-sm text-primary-600 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}