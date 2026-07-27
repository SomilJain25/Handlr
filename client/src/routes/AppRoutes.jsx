import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';

// Phase 2+ will add: Login, Register, ForgotPassword, Dashboard, Jobs,
// JobDetails, CreateJob, EditJob, FreelancerProfile, ClientProfile,
// Messages, Notifications, Settings, Reviews, About, Contact

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
