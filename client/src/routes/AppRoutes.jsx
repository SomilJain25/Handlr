import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import VerifyEmail from '../pages/VerifyEmail';
import Dashboard from '../pages/Dashboard';
import FreelancerProfile from '../pages/FreelancerProfile';
import ClientProfile from '../pages/ClientProfile';
import Jobs from '../pages/Jobs';
import JobDetails from '../pages/JobDetails';
import CreateJob from '../pages/CreateJob';
import EditJob from '../pages/EditJob';
import MyProposals from '../pages/MyProposals';
import JobProposals from '../pages/JobProposals';
import Messages from '../pages/Messages';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

// Phase 7+ will add: Notifications, Settings, Reviews, About, Contact

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/freelancer"
        element={
          <ProtectedRoute roles={['freelancer']}>
            <FreelancerProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/client"
        element={
          <ProtectedRoute roles={['client']}>
            <ClientProfile />
          </ProtectedRoute>
        }
      />

      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />

      <Route
        path="/jobs/new"
        element={
          <ProtectedRoute roles={['client']}>
            <CreateJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/:id/edit"
        element={
          <ProtectedRoute roles={['client']}>
            <EditJob />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/:id/proposals"
        element={
          <ProtectedRoute roles={['client']}>
            <JobProposals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-proposals"
        element={
          <ProtectedRoute roles={['freelancer']}>
            <MyProposals />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route
        path="/messages/:id"
        element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}