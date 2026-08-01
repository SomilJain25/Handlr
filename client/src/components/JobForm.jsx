import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { CATEGORIES_QUERY } from '../graphql/job';
import FormField from './FormField';
import Select from './Select';

/**
 * <JobForm defaultValues={...} onSubmit={fn} submitLabel="Post job" />
 */
export default function JobForm({ defaultValues, onSubmit, submitLabel, submitting }) {
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      budget: '',
      deadline: '',
      skillsText: '',
      experienceLevel: 'intermediate',
      categoryId: '',
      locationType: 'remote',
      ...defaultValues,
    },
  });

  // Select isn't a native input, so it can't take a ref from register().
  // Register the field for validation tracking, then drive it via setValue.
  register('categoryId', { required: 'Category is required' });

  const submit = (values) => {
    onSubmit({
      title: values.title,
      description: values.description,
      budget: Number(values.budget),
      deadline: values.deadline || null,
      skillsRequired: values.skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      experienceLevel: values.experienceLevel,
      categoryId: values.categoryId,
      locationType: values.locationType,
    });
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FormField label="Job title" error={errors.title}>
        <input
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
          {...register('title', { required: 'Title is required' })}
        />
      </FormField>

      <FormField label="Description" error={errors.description}>
        <textarea
          rows={6}
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
          {...register('description', { required: 'Description is required' })}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Budget (USD)" error={errors.budget}>
          <input
            type="number"
            step="0.01"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('budget', { required: 'Budget is required', min: 1 })}
          />
        </FormField>

        <FormField label="Deadline">
          <input
            type="date"
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('deadline')}
          />
        </FormField>
      </div>

      <FormField label="Skills required (comma-separated)">
        <input
          placeholder="React, Node.js, GraphQL"
          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
          {...register('skillsText')}
        />
      </FormField>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="Category" error={errors.categoryId}>
          <Select
            value={watch('categoryId')}
            onChange={(v) => setValue('categoryId', v, { shouldValidate: true })}
            placeholder="Select…"
            options={
              categoriesData?.categories.map((c) => ({ value: c.id, label: c.name })) || []
            }
          />
          {categoriesData && categoriesData.categories.length === 0 && (
            <p className="mt-1 text-xs text-amber-500">
              No categories exist yet — an admin needs to run the seed script.
            </p>
          )}
        </FormField>

        <FormField label="Experience level">
          <Select
            value={watch('experienceLevel')}
            onChange={(v) => setValue('experienceLevel', v)}
            options={[
              { value: 'entry', label: 'Entry level' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'expert', label: 'Expert' },
            ]}
          />
        </FormField>

        <FormField label="Location">
          <Select
            value={watch('locationType')}
            onChange={(v) => setValue('locationType', v)}
            options={[
              { value: 'remote', label: 'Remote' },
              { value: 'hybrid', label: 'Hybrid' },
              { value: 'onsite', label: 'Onsite' },
            ]}
          />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}