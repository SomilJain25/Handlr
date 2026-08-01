import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JOBS_QUERY, CATEGORIES_QUERY } from '../graphql/job';
import JobCard from '../components/JobCard';
import { SkeletonGrid } from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Select from '../components/Select';

const PAGE_SIZE = 12;

export default function Jobs() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [locationType, setLocationType] = useState('');
  const [sort, setSort] = useState('NEWEST');
  const [offset, setOffset] = useState(0);

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);

  const filter = {
    ...(search && { search }),
    ...(categoryId && { categoryId }),
    ...(experienceLevel && { experienceLevel }),
    ...(locationType && { locationType }),
  };

  const { data, loading, error } = useQuery(JOBS_QUERY, {
    variables: { filter, sort, limit: PAGE_SIZE, offset },
    fetchPolicy: 'cache-and-network',
  });

  const resetAndFilter = (setter) => (value) => {
    setter(value);
    setOffset(0);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Browse jobs</h1>
        {user?.role === 'client' && (
          <Link
            to="/jobs/new"
            className="px-4 py-2 rounded-md bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition"
          >
            Post a job
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <input
          placeholder="Search jobs…"
          value={search}
          onChange={(e) => resetAndFilter(setSearch)(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />

        <Select
          value={categoryId}
          onChange={resetAndFilter(setCategoryId)}
          placeholder="All categories"
          className="w-48"
          options={[
            { value: '', label: 'All categories' },
            ...(categoriesData?.categories.map((c) => ({ value: c.id, label: c.name })) || []),
          ]}
        />

        <Select
          value={experienceLevel}
          onChange={resetAndFilter(setExperienceLevel)}
          placeholder="Any experience"
          className="w-44"
          options={[
            { value: '', label: 'Any experience' },
            { value: 'entry', label: 'Entry level' },
            { value: 'intermediate', label: 'Intermediate' },
            { value: 'expert', label: 'Expert' },
          ]}
        />

        <Select
          value={locationType}
          onChange={resetAndFilter(setLocationType)}
          placeholder="Any location"
          className="w-40"
          options={[
            { value: '', label: 'Any location' },
            { value: 'remote', label: 'Remote' },
            { value: 'hybrid', label: 'Hybrid' },
            { value: 'onsite', label: 'Onsite' },
          ]}
        />

        <Select
          value={sort}
          onChange={resetAndFilter(setSort)}
          className="w-52"
          options={[
            { value: 'NEWEST', label: 'Newest' },
            { value: 'OLDEST', label: 'Oldest' },
            { value: 'BUDGET_HIGH', label: 'Budget: high to low' },
            { value: 'BUDGET_LOW', label: 'Budget: low to high' },
          ]}
        />
      </div>

      {loading && !data && <SkeletonGrid count={6} />}
      {error && <p className="text-red-500 text-sm">Failed to load jobs: {error.message}</p>}

      {data?.jobs.jobs.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No jobs match your filters"
          subtitle="Try widening your search or clearing a filter."
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.jobs.jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {data?.jobs && (
        <div className="flex items-center justify-between mt-8 text-sm">
          <span className="text-gray-400">
            Showing {data.jobs.jobs.length ? offset + 1 : 0}–{offset + data.jobs.jobs.length} of{' '}
            {data.jobs.total}
          </span>
          <div className="flex gap-2">
            <button
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={!data.jobs.hasMore}
              onClick={() => setOffset(offset + PAGE_SIZE)}
              className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}