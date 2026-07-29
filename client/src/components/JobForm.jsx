import { useForm } from 'react-hook-form';
import { useQuery } from '@apollo/client';
import { CATEGORIES_QUERY } from '../graphql/job';
import FormField from './FormField';

/**
 * <JobForm defaultValues={...} onSubmit={fn} submitLabel="Post job" />
 */
export default function JobForm({ defaultValues, onSubmit, submitLabel, submitting }) {
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);

  const {
    register,
    handleSubmit,
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
          <select
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('categoryId', { required: 'Category is required' })}
          >
            <option value="">Select…</option>
            {categoriesData?.categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Experience level">
          <select
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('experienceLevel')}
          >
            <option value="entry">Entry level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </FormField>

        <FormField label="Location">
          <select
            className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2"
            {...register('locationType')}
          >
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>
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