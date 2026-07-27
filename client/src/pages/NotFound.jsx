import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        This page doesn't exist.
      </p>
      <Link
        to="/"
        className="px-4 py-2 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition"
      >
        Back home
      </Link>
    </div>
  );
}
