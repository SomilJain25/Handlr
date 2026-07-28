import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

/**
 * <FileUploadButton uploadFn={uploadAvatar} accept="image/*" label="Upload photo"
 *    onUploaded={(url) => setValue('profilePicture', url)} />
 */
export default function FileUploadButton({ uploadFn, accept, label, onUploaded }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);

  const handleChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProgress(0);
    try {
      const { url } = await uploadFn(file, setProgress);
      onUploaded(url);
      toast.success('Upload complete');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setProgress(null);
      e.target.value = '';
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-3 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        {progress !== null ? `Uploading… ${progress}%` : label}
      </button>
    </div>
  );
}