import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { ME_FULL_QUERY, UPDATE_PROFILE_MUTATION } from '../graphql/profile';
import {
  uploadAvatar,
  uploadResume,
  uploadPortfolioImage,
} from '../services/uploadService';
import FormField from '../components/FormField';
import FileUploadButton from '../components/FileUploadButton';

export default function FreelancerProfile() {
  const { data, loading } = useQuery(ME_FULL_QUERY, { fetchPolicy: 'network-only' });
  const [updateProfile, { loading: saving }] = useMutation(UPDATE_PROFILE_MUTATION);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      bio: '',
      skillsText: '',
      hourlyRate: '',
      availability: 'full_time',
      resumeUrl: '',
      profilePicture: '',
      github: '',
      linkedin: '',
      website: '',
      portfolio: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'portfolio' });

  useEffect(() => {
    if (!data?.me) return;
    const u = data.me;
    reset({
      name: u.name || '',
      bio: u.bio || '',
      skillsText: (u.skills || []).join(', '),
      hourlyRate: u.hourlyRate ?? '',
      availability: u.availability || 'full_time',
      resumeUrl: u.resumeUrl || '',
      profilePicture: u.profilePicture || '',
      github: u.github || '',
      linkedin: u.linkedin || '',
      website: u.website || '',
      portfolio: u.portfolio || [],
    });
  }, [data, reset]);

  const [avatarPreview, setAvatarPreview] = useState('');
  useEffect(() => setAvatarPreview(watch('profilePicture')), [watch('profilePicture')]);

  const onSubmit = async (values) => {
    try {
      await updateProfile({
        variables: {
          input: {
            name: values.name,
            bio: values.bio,
            skills: values.skillsText
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
            hourlyRate: values.hourlyRate ? Number(values.hourlyRate) : null,
            availability: values.availability,
            resumeUrl: values.resumeUrl,
            profilePicture: values.profilePicture,
            github: values.github,
            linkedin: values.linkedin,
            website: values.website,
            portfolio: values.portfolio.map(({ title, url, image }) => ({
              title,
              url,
              image,
            })),
          },
        },
      });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-10 text-gray-400">Loading profile…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold">Freelancer Profile</h1>
        {data?.me?.reviewCount > 0 && (
          <span className="text-sm text-amber-500">
            ★ {data.me.averageRating} ({data.me.reviewCount} review{data.me.reviewCount === 1 ? '' : 's'})
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex items-center gap-4 mb-6">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-gray-200 dark:border-gray-800"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800" />
          )}
          <FileUploadButton
            uploadFn={uploadAvatar}
            accept="image/*"
            label="Upload photo"
            onUploaded={(url) => setValue('profilePicture', url)}
          />
        </div>

        <FormField label="Full name" error={errors.name}>
          <input
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('name', { required: 'Name is required' })}
          />
        </FormField>

        <FormField label="Bio">
          <textarea
            rows={4}
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('bio')}
          />
        </FormField>

        <FormField label="Skills (comma-separated)">
          <input
            placeholder="React, Node.js, GraphQL"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('skillsText')}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Hourly rate (USD)">
            <input
              type="number"
              step="0.01"
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
              {...register('hourlyRate')}
            />
          </FormField>

          <FormField label="Availability">
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
              {...register('availability')}
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="not_available">Not available</option>
            </select>
          </FormField>
        </div>

        <FormField label="Resume">
          <div className="flex items-center gap-3">
            <FileUploadButton
              uploadFn={uploadResume}
              accept="application/pdf"
              label="Upload resume (PDF)"
              onUploaded={(url) => setValue('resumeUrl', url)}
            />
            {watch('resumeUrl') && (
              <a
                href={watch('resumeUrl')}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                View current
              </a>
            )}
          </div>
        </FormField>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="GitHub">
            <input
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
              {...register('github')}
            />
          </FormField>
          <FormField label="LinkedIn">
            <input
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
              {...register('linkedin')}
            />
          </FormField>
          <FormField label="Website">
            <input
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
              {...register('website')}
            />
          </FormField>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Portfolio</label>
            <button
              type="button"
              onClick={() => append({ title: '', url: '', image: '' })}
              className="text-sm text-primary-600 hover:underline"
            >
              + Add item
            </button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="border border-gray-200 dark:border-gray-800 rounded-md p-3 mb-3"
            >
              <div className="grid grid-cols-2 gap-3 mb-2">
                <input
                  placeholder="Project title"
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  {...register(`portfolio.${index}.title`)}
                />
                <input
                  placeholder="Project URL"
                  className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                  {...register(`portfolio.${index}.url`)}
                />
              </div>
              <div className="flex items-center gap-3">
                <FileUploadButton
                  uploadFn={uploadPortfolioImage}
                  accept="image/*"
                  label="Upload image"
                  onUploaded={(url) => setValue(`portfolio.${index}.image`, url)}
                />
                {watch(`portfolio.${index}.image`) && (
                  <img
                    src={watch(`portfolio.${index}.image`)}
                    alt=""
                    className="w-10 h-10 rounded object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="ml-auto text-sm text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
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