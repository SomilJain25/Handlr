import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { ME_FULL_QUERY, UPDATE_PROFILE_MUTATION } from '../graphql/profile';
import { uploadAvatar, uploadCompanyLogo } from '../services/uploadService';
import FormField from '../components/FormField';
import FileUploadButton from '../components/FileUploadButton';

export default function ClientProfile() {
  const { data, loading } = useQuery(ME_FULL_QUERY, { fetchPolicy: 'network-only' });
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE_MUTATION);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      profilePicture: '',
      companyName: '',
      companyLogo: '',
      industry: '',
      description: '',
      website: '',
      contactNumber: '',
    },
  });

  useEffect(() => {
    if (!data?.me) return;
    const u = data.me;
    reset({
      name: u.name || '',
      profilePicture: u.profilePicture || '',
      companyName: u.companyName || '',
      companyLogo: u.companyLogo || '',
      industry: u.industry || '',
      description: u.description || '',
      website: u.website || '',
      contactNumber: u.contactNumber || '',
    });
  }, [data, reset]);

  const [logoPreview, setLogoPreview] = useState('');
  useEffect(() => setLogoPreview(watch('companyLogo')), [watch('companyLogo')]);

  const onSubmit = async (values) => {
    try {
      await updateProfile({ variables: { input: values } });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-10 text-gray-400">Loading profile…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Client Profile</h1>
        {data?.me?.reviewCount > 0 && (
          <span className="text-sm text-amber-500">
            ★ {data.me.averageRating} ({data.me.reviewCount} review{data.me.reviewCount === 1 ? '' : 's'})
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex items-center gap-4 mb-6">
          {logoPreview ? (
            <img
              src={logoPreview}
              alt="Company logo"
              className="w-16 h-16 rounded-md object-cover border border-gray-200 dark:border-gray-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-md bg-gray-100 dark:bg-gray-800" />
          )}
          <FileUploadButton
            uploadFn={uploadCompanyLogo}
            accept="image/*"
            label="Upload logo"
            onUploaded={(url) => setValue('companyLogo', url)}
          />
        </div>

        <FormField label="Contact name" error={errors.name}>
          <input
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('name', { required: 'Name is required' })}
          />
        </FormField>

        <FormField label="Company name">
          <input
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('companyName')}
          />
        </FormField>

        <FormField label="Industry">
          <input
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('industry')}
          />
        </FormField>

        <FormField label="Company description">
          <textarea
            rows={4}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('description')}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Website">
            <input
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
              {...register('website')}
            />
          </FormField>
          <FormField label="Contact number">
            <input
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
              {...register('contactNumber')}
            />
          </FormField>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
            Profile picture
          </label>
          <FileUploadButton
            uploadFn={uploadAvatar}
            accept="image/*"
            label="Upload photo"
            onUploaded={(url) => setValue('profilePicture', url)}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </div>
  );
}