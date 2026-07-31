/**
 * <MiniBarChart title="Monthly earnings" data={[{month:'Jan', value:120}, ...]} valuePrefix="$" />
 * <MiniBarChart title="Job status" data={[{status:'open', count:3}, ...]} labelKey="status" valueKey="count" />
 */
export default function MiniBarChart({ title, data, labelKey = 'month', valueKey = 'value', valuePrefix = '' }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div className="text-sm font-semibold mb-4">{title}</div>
      {data.length === 0 ? (
        <p className="text-xs text-gray-400">No data yet.</p>
      ) : (
        <div className="flex items-end gap-2 h-32">
          {data.map((d) => (
            <div key={d[labelKey]} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-gray-400">
                {valuePrefix}
                {typeof d[valueKey] === 'number' ? d[valueKey].toLocaleString() : d[valueKey]}
              </span>
              <div
                className="w-full bg-primary-500 rounded-t-sm min-h-[2px]"
                style={{ height: `${Math.max(2, (d[valueKey] / max) * 100)}%` }}
              />
              <span className="text-[10px] text-gray-400 capitalize truncate w-full text-center">
                {d[labelKey]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}