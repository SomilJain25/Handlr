export default function ServerError({ onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-6xl font-bold mb-2">500</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        Something went wrong on our end. Try again, or head back home.
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            Try again
          </button>
        )}
        <a
          href="/"
          className="px-4 py-2 rounded-md bg-primary-500 text-white text-sm hover:bg-primary-600 transition"
        >
          Back home
        </a>
      </div>
    </div>
  );
}