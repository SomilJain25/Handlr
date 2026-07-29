import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { JOBS_QUERY, CATEGORIES_QUERY } from '../graphql/job';
import JobCard from '../components/JobCard';

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

  const resetAndFilter = (setter) => (e) => {
    setter(e.target.value);
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
          onChange={resetAndFilter(setSearch)}
          className="flex-1 min-w-[200px] rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        />

        <select
          value={categoryId}
          onChange={resetAndFilter(setCategoryId)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {categoriesData?.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={experienceLevel}
          onChange={resetAndFilter(setExperienceLevel)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">Any experience</option>
          <option value="entry">Entry level</option>
          <option value="intermediate">Intermediate</option>
          <option value="expert">Expert</option>
        </select>

        <select
          value={locationType}
          onChange={resetAndFilter(setLocationType)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="">Any location</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>

        <select
          value={sort}
          onChange={resetAndFilter(setSort)}
          className="rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
        >
          <option value="NEWEST">Newest</option>
          <option value="OLDEST">Oldest</option>
          <option value="BUDGET_HIGH">Budget: high to low</option>
          <option value="BUDGET_LOW">Budget: low to high</option>
        </select>
      </div>

      {loading && !data && <p className="text-gray-400 text-sm">Loading jobs…</p>}
      {error && <p className="text-red-500 text-sm">Failed to load jobs: {error.message}</p>}

      {data?.jobs.jobs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No jobs match your filters.</p>
        </div>
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