import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { JOB_QUERY, UPDATE_JOB_MUTATION } from '../graphql/job';
import JobForm from '../components/JobForm';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading } = useQuery(JOB_QUERY, { variables: { id } });
  const [updateJob, { loading: saving }] = useMutation(UPDATE_JOB_MUTATION);

  const handleSubmit = async (input) => {
    try {
      await updateJob({ variables: { id, input } });
      toast.success('Job updated');
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  if (loading) return <div className="p-10 text-gray-400">Loading job…</div>;
  if (!data?.job) return <div className="p-10 text-red-500">Job not found.</div>;

  const job = data.job;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Edit job</h1>
      <JobForm
        defaultValues={{
          title: job.title,
          description: job.description,
          budget: job.budget,
          deadline: job.deadline ? job.deadline.slice(0, 10) : '',
          skillsText: job.skillsRequired.join(', '),
          experienceLevel: job.experienceLevel,
          categoryId: job.category.id,
          locationType: job.locationType,
        }}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
        submitting={saving}
      />
    </div>
  );
}