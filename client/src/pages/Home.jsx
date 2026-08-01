import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES_QUERY } from '../graphql/job';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  const { user } = useAuth();
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);

  return (
    <div>
      {/* Hero */}
      <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4 }}
          className="text-4xl sm:text-5xl font-bold tracking-tight mb-4"
        >
          Hire top tech talent.
          <br />
          <span className="text-primary-500">Build your next project.</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto mb-8"
        >
          Handlr is a freelance marketplace built exclusively for developers, designers, and
          technology professionals — post work, submit proposals, and get paid, all in one place.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={fadeUp}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {user ? (
            <>
              <Link
                to="/jobs"
                className="px-6 py-3 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition"
              >
                Browse jobs
              </Link>
              <Link
                to="/dashboard"
                className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/register"
                className="px-6 py-3 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition"
              >
                Get started — it's free
              </Link>
              <Link
                to="/jobs"
                className="px-6 py-3 rounded-md border border-gray-300 dark:border-gray-700 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                Browse open jobs
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* Categories */}
      {categoriesData?.categories.length > 0 && (
        <section className="px-6 pb-16 max-w-5xl mx-auto">
          <h2 className="text-center text-sm font-medium text-gray-400 mb-4 uppercase tracking-wide">
            Popular categories
          </h2>
          <div className="flex flex-wrap justify-center gap-2">
            {categoriesData.categories.map((c) => (
              <Link
                key={c.id}
                to="/jobs"
                className="text-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800 hover:border-primary-400 dark:hover:border-primary-500 hover:text-primary-600 transition"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">How Handlr works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h3 className="font-semibold text-primary-600 mb-4">For clients</h3>
              <ol className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-gray-300 dark:text-gray-600">01</span>
                  Post a job with your budget, timeline, and required skills.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-300 dark:text-gray-600">02</span>
                  Review proposals, shortlist candidates, and message freelancers directly.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-300 dark:text-gray-600">03</span>
                  Hire, collaborate, and leave a review once the work is done.
                </li>
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-primary-600 mb-4">For freelancers</h3>
              <ol className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-gray-300 dark:text-gray-600">01</span>
                  Build your profile — skills, portfolio, hourly rate, resume.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-300 dark:text-gray-600">02</span>
                  Browse open jobs and submit proposals with your rate and timeline.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-gray-300 dark:text-gray-600">03</span>
                  Get hired, chat in real time, and build your reputation with reviews.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      {!user && (
        <section className="px-6 py-16 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Join as a freelancer or a client — it takes less than a minute.
          </p>
          <Link
            to="/register"
            className="inline-block px-6 py-3 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition"
          >
            Create your account
          </Link>
        </section>
      )}
    </div>
  );
}