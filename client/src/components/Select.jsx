import { useEffect, useRef, useState } from 'react';

/**
 * Fully custom dropdown. Native <select> popups are rendered by the OS/browser,
 * not by our CSS, which is why dark mode support for them is unreliable across
 * browsers - this component sidesteps that entirely by building the option list
 * out of regular styled DOM.
 *
 * <Select value={x} onChange={setX} options={[{value:'a', label:'A'}]} placeholder="Pick one" />
 */
export default function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-transparent px-3 py-2 text-sm text-left text-gray-800 dark:text-gray-100 hover:border-gray-400 dark:hover:border-gray-600 transition"
      >
        <span className={selected ? 'text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
          {selected ? selected.label : placeholder}
        </span>
        <span className="text-gray-400 dark:text-gray-400 text-xs shrink-0">{open ? '▴' : '▾'}</span>
      </button>

      {open && (
        <div className="absolute left-0 z-20 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                opt.value === value
                  ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                  : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}