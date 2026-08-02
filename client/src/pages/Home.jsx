import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES_QUERY, JOBS_QUERY } from '../graphql/job';
import { getCategoryStyle } from '../utils/categoryIcons';
import Footer from '../components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const LOCATION_LABEL = { remote: 'Remote', hybrid: 'Hybrid', onsite: 'Onsite' };

function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Home() {
  const { user } = useAuth();
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const { data: jobsData } = useQuery(JOBS_QUERY, {
    variables: { filter: {}, sort: 'NEWEST', limit: 3, offset: 0 },
  });

  const trendingJobs = jobsData?.jobs.jobs || [];

  return (
    <div>
      {/* Hero */}
      <section className="relative px-6 pt-20 pb-24 max-w-5xl mx-auto text-center overflow-hidden">
        {/* Glow orbs - purely decorative, matches the design reference */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/10 dark:bg-blue-500/[0.12] blur-[100px] rounded-full" />
        <div className="pointer-events-none absolute top-20 right-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/10 blur-[100px] rounded-full" />

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="relative inline-flex items-center gap-2 bg-gray-100/80 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/40 px-4 py-1.5 rounded-full text-sm text-gray-500 dark:text-gray-400 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Built for developers, designers &amp; tech professionals
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6"
        >
          Hire top tech talent.
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Build your next project.
          </span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="relative text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto mb-10"
        >
          Handlr is a freelance marketplace built exclusively for technology professionals —
          post work, submit proposals, and get paid, all in one place.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="relative flex flex-wrap items-center justify-center gap-3 mb-16"
        >
          {user ? (
            <>
              <Link
                to="/jobs"
                className="px-8 py-3.5 rounded-2xl bg-primary-500 text-white font-semibold shadow-glow hover:bg-primary-400 hover:shadow-glow-lg hover:-translate-y-0.5 transition"
              >
                Browse jobs
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/40 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700/60 transition"
              >
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl bg-primary-500 text-white font-semibold shadow-glow hover:bg-primary-400 hover:shadow-glow-lg hover:-translate-y-0.5 transition"
              >
                Get started — it's free
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gray-100 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700/40 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700/60 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse open jobs
              </Link>
            </>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="relative grid grid-cols-3 gap-6 max-w-xl mx-auto pt-8 border-t border-gray-200 dark:border-gray-800/80"
        >
          <div>
            <div className="text-2xl mb-1">🔒</div>
            <div className="text-xs text-gray-400">Cloudinary-backed uploads</div>
          </div>
          <div>
            <div className="text-2xl mb-1">💬</div>
            <div className="text-xs text-gray-400">Real-time chat &amp; alerts</div>
          </div>
          <div>
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-xs text-gray-400">Verified ratings &amp; reviews</div>
          </div>
        </motion.div>
      </section>

      {/* Categories */}
      {categoriesData?.categories.length > 0 && (
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
              Popular Categories
            </p>
            <h2 className="text-xl font-bold">Find specialists in any domain</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categoriesData.categories.map((c) => {
              const style = getCategoryStyle(c.slug);
              return (
                <Link
                  key={c.id}
                  to="/jobs"
                  className="group flex items-center gap-2.5 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700/25 px-5 py-3 rounded-2xl hover:border-gray-300 dark:hover:border-gray-600/40 hover:-translate-y-0.5 transition"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: style.bg }}
                  >
                    <svg
                      className="w-4 h-4"
                      style={{ color: style.color }}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={style.path} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Trending jobs */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-500 mb-1">
              Fresh Opportunities
            </p>
            <h2 className="text-xl font-bold">Trending jobs right now</h2>
          </div>
          <Link
            to="/jobs"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-400 transition"
          >
            View all jobs
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {trendingJobs.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No jobs posted yet — be the first.
            </p>
            <Link
              to={user?.role === 'client' ? '/jobs/new' : '/register'}
              className="text-sm font-semibold text-blue-500 hover:text-blue-400"
            >
              {user?.role === 'client' ? 'Post a job →' : 'Sign up as a client →'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingJobs.map((job) => {
              const companyName = job.client.companyName || job.client.name;
              return (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="group bg-gray-50 dark:bg-gray-800/25 border border-gray-200 dark:border-gray-700/20 rounded-2xl p-6 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600/35 hover:-translate-y-1 hover:shadow-xl transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-extrabold text-xs">
                      {initials(companyName)}
                    </div>
                    <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                      ${job.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="font-bold mb-1 group-hover:text-blue-400 transition">{job.title}</div>
                  <div className="text-sm text-gray-400 mb-4">
                    {companyName} · {LOCATION_LABEL[job.locationType]}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-xs text-gray-400 bg-gray-200/60 dark:bg-gray-700/40 px-2.5 py-1 rounded-md"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA banner */}
      <section className="px-6 pb-20 max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-10 sm:p-16">
          <div className="pointer-events-none absolute -top-32 -right-16 w-96 h-96 bg-white/5 rounded-full blur-[80px]" />
          <div className="pointer-events-none absolute -bottom-32 -left-16 w-96 h-96 bg-white/5 rounded-full blur-[80px]" />
          <div className="relative flex flex-wrap items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                {user ? 'Ready to find your next gig?' : 'Ready to get started?'}
              </h2>
              <p className="text-blue-100 max-w-md">
                {user
                  ? 'Browse open roles or check your dashboard for what needs your attention.'
                  : "Join as a freelancer or a client — it takes less than a minute."}
              </p>
            </div>
            <Link
              to={user ? '/jobs' : '/register'}
              className="shrink-0 px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold shadow-xl hover:bg-blue-50 hover:-translate-y-0.5 transition"
            >
              {user ? 'Browse jobs' : 'Create your account'}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}