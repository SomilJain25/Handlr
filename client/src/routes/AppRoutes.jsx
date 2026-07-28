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
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

// Phase 4+ will add: Jobs, JobDetails, CreateJob, EditJob, Messages,
// Notifications, Settings, Reviews, About, Contact

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

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}