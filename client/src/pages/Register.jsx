import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../layouts/AuthLayout';
import FormField from '../components/FormField';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'freelancer' } });

  const password = watch('password');

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      toast.success('Account created! Check your email to verify your address.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Join Handlr as a freelancer or a client.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormField label="I am a...">
          <div className="grid grid-cols-2 gap-3">
            {['freelancer', 'client'].map((r) => (
              <label
                key={r}
                className="flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-700 rounded-md py-2 cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 dark:has-[:checked]:bg-primary-500/10"
              >
                <input type="radio" value={r} className="accent-primary-500" {...register('role')} />
                <span className="capitalize text-sm">{r}</span>
              </label>
            ))}
          </div>
        </FormField>

        <FormField label="Full name" error={errors.name}>
          <input
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('name', { required: 'Name is required' })}
          />
        </FormField>

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
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
            })}
          />
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword}>
          <input
            type="password"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === password || 'Passwords do not match',
            })}
          />
        </FormField>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
        >
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  );
}