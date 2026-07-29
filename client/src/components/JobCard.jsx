import { Link } from 'react-router-dom';

const EXPERIENCE_LABEL = { entry: 'Entry level', intermediate: 'Intermediate', expert: 'Expert' };
const LOCATION_LABEL = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' };

export default function JobCard({ job }) {
  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block border border-gray-200 dark:border-gray-800 rounded-lg p-5 hover:border-primary-400 dark:hover:border-primary-500 transition bg-white dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-lg leading-snug">{job.title}</h3>
        <span className="whitespace-nowrap text-sm font-medium text-primary-600">
          ${job.budget.toLocaleString()}
        </span>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {job.skillsRequired.slice(0, 4).map((skill) => (
          <span
            key={skill}
            className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          {job.category?.name} · {EXPERIENCE_LABEL[job.experienceLevel]} · {LOCATION_LABEL[job.locationType]}
        </span>
        <span>{job.proposalCount} proposal{job.proposalCount === 1 ? '' : 's'}</span>
      </div>
    </Link>
  );
}