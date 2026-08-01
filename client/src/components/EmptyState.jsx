export default function EmptyState({ icon = '📭', title, subtitle, action }) {
  return (
    <div className="text-center py-16 px-6">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-medium text-gray-600 dark:text-gray-300">{title}</p>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}