import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CREATE_JOB_MUTATION, JOBS_QUERY } from '../graphql/job';
import JobForm from '../components/JobForm';

export default function CreateJob() {
  const navigate = useNavigate();
  const [createJob, { loading }] = useMutation(CREATE_JOB_MUTATION, {
    refetchQueries: [{ query: JOBS_QUERY, variables: { filter: {}, limit: 12, offset: 0 } }],
  });

  const handleSubmit = async (input) => {
    try {
      const { data } = await createJob({ variables: { input } });
      toast.success('Job posted');
      navigate(`/jobs/${data.createJob.id}`);
    } catch (err) {
      toast.error(err.message || 'Could not create job');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Post a job</h1>
      <JobForm onSubmit={handleSubmit} submitLabel="Post job" submitting={loading} />
    </div>
  );
}