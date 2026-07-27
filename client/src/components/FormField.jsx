export default function FormField({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}