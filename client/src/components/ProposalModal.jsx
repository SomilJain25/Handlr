import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { APPLY_JOB_MUTATION, MY_PROPOSALS_QUERY } from '../graphql/proposal';
import { JOB_QUERY } from '../graphql/job';
import { uploadProposalAttachment } from '../services/uploadService';
import FormField from './FormField';
import FileUploadButton from './FileUploadButton';

export default function ProposalModal({ jobId, onClose, onSubmitted }) {
  const [applyJob, { loading }] = useMutation(APPLY_JOB_MUTATION, {
    refetchQueries: [
      { query: JOB_QUERY, variables: { id: jobId } },
      { query: MY_PROPOSALS_QUERY, variables: {} },
    ],
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      coverLetter: '',
      proposedBudget: '',
      estimatedDuration: '',
      attachmentUrl: '',
      attachmentName: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await applyJob({
        variables: {
          jobId,
          input: {
            coverLetter: values.coverLetter,
            proposedBudget: Number(values.proposedBudget),
            estimatedDuration: values.estimatedDuration,
            attachments: values.attachmentUrl
              ? [{ name: values.attachmentName, url: values.attachmentUrl }]
              : [],
          },
        },
      });
      toast.success('Proposal submitted');
      onSubmitted?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not submit proposal');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Submit a proposal</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField label="Cover letter" error={errors.coverLetter}>
            <textarea
              rows={5}
              className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
              {...register('coverLetter', { required: 'Cover letter is required' })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Proposed budget (USD)" error={errors.proposedBudget}>
              <input
                type="number"
                step="0.01"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                {...register('proposedBudget', { required: 'Required', min: 1 })}
              />
            </FormField>
            <FormField label="Estimated duration" error={errors.estimatedDuration}>
              <input
                placeholder="e.g. 2 weeks"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm"
                {...register('estimatedDuration', { required: 'Required' })}
              />
            </FormField>
          </div>

          <FormField label="Attachment (optional)">
            <div className="flex items-center gap-3">
              <FileUploadButton
                uploadFn={uploadProposalAttachment}
                accept="image/*,application/pdf,application/zip"
                label="Attach a file"
                onUploaded={(url) => {
                  setValue('attachmentUrl', url);
                  setValue('attachmentName', url.split('/').pop());
                }}
              />
              {watch('attachmentUrl') && (
                <span className="text-xs text-gray-400">Attached ✓</span>
              )}
            </div>
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-md bg-primary-500 text-white font-medium hover:bg-primary-600 transition disabled:opacity-60"
          >
            {loading ? 'Submitting…' : 'Submit proposal'}
          </button>
        </form>
      </div>
    </div>
  );
}