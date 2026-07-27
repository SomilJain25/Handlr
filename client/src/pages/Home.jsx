import { useQuery, gql } from '@apollo/client';
import { motion } from 'framer-motion';

const HEALTH_QUERY = gql`
  query Health {
    _health
  }
`;

export default function Home() {
  const { data, loading, error } = useQuery(HEALTH_QUERY);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-4xl font-bold mb-4"
      >
        Handlr
      </motion.h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        A modern freelance marketplace for technology professionals.
      </p>

      <div className="rounded-lg border border-gray-200 dark:border-gray-800 px-4 py-3 text-sm">
        {loading && 'Checking API connection…'}
        {error && (
          <span className="text-red-500">
            API unreachable — is the server running on port 5000?
          </span>
        )}
        {data && (
          <span className="text-green-600 dark:text-green-400">
            API connected ✓ (status: {data._health})
          </span>
        )}
      </div>
    </div>
  );
}
