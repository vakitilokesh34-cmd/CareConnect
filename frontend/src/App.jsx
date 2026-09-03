import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Route Guards
import { ProtectedRoute, RoleProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ServicesPage from './pages/ServicesPage';
import ProviderSearchPage from './pages/ProviderSearchPage';
import ProviderDetailsPage from './pages/ProviderDetailsPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateServiceRequest from './pages/customer/CreateServiceRequest';
import MyServiceRequests from './pages/customer/MyServiceRequests';
import MyBookings from './pages/customer/MyBookings';
import BookingDetails from './pages/customer/BookingDetails';
import ProviderRecommendations from './pages/customer/ProviderRecommendations';
import InvoicePage from './pages/customer/InvoicePage';
import DisputesPage from './pages/customer/DisputesPage';
import ProfileSettings from './pages/customer/ProfileSettings';

// Provider Pages
import ProviderDashboard from './pages/provider/ProviderDashboard';
import IncomingRequests from './pages/provider/IncomingRequests';
import ActiveJobs from './pages/provider/ActiveJobs';
import MyQuotes from './pages/provider/MyQuotes';
import EarningsPage from './pages/provider/EarningsPage';
import AvailabilityPage from './pages/provider/AvailabilityPage';
import ProviderProfileMgmt from './pages/provider/ProviderProfileMgmt';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProviderVerification from './pages/admin/ProviderVerification';
import ServiceCategories from './pages/admin/ServiceCategories';
import AdminDisputes from './pages/admin/AdminDisputes';
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Ops Pages
import OpsDashboard from './pages/ops/OpsDashboard';
import OpsBookings from './pages/ops/OpsBookings';
import OpsAssign from './pages/ops/OpsAssign';
import OpsQuality from './pages/ops/OpsQuality';

// Support Pages
import SupportDashboard from './pages/support/SupportDashboard';
import SupportDisputes from './pages/support/SupportDisputes';

// Dashboard redirect based on role
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'CUSTOMER': return <Navigate to="/dashboard/customer" replace />;
    case 'SERVICE_PROVIDER': return <Navigate to="/dashboard/provider" replace />;
    case 'PLATFORM_ADMIN': return <Navigate to="/dashboard/admin" replace />;
    case 'OPERATIONS_MANAGER': return <Navigate to="/dashboard/ops" replace />;
    case 'SUPPORT_AGENT': return <Navigate to="/dashboard/support" replace />;
    default: return <Navigate to="/" replace />;
  }
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/providers" element={<ProviderSearchPage />} />
        <Route path="/providers/:id" element={<ProviderDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Dashboard root redirect */}
      <Route path="/dashboard" element={<ProtectedRoute />}>
        <Route index element={<DashboardRedirect />} />

        {/* Customer Dashboard */}
        <Route element={<RoleProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="customer" element={<CustomerDashboard />} />
            <Route path="customer/requests/new" element={<CreateServiceRequest />} />
            <Route path="customer/requests" element={<MyServiceRequests />} />
            <Route path="customer/bookings" element={<MyBookings />} />
            <Route path="customer/bookings/:id" element={<BookingDetails />} />
            <Route path="customer/bookings/:id/recommendations" element={<ProviderRecommendations />} />
            <Route path="customer/bookings/:id/invoice" element={<InvoicePage />} />
            <Route path="customer/disputes" element={<DisputesPage />} />
            <Route path="profile" element={<ProfileSettings />} />
          </Route>
        </Route>

        {/* Provider Dashboard */}
        <Route element={<RoleProtectedRoute allowedRoles={['SERVICE_PROVIDER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="provider" element={<ProviderDashboard />} />
            <Route path="provider/requests" element={<IncomingRequests />} />
            <Route path="provider/jobs" element={<ActiveJobs />} />
            <Route path="provider/quotes" element={<MyQuotes />} />
            <Route path="provider/earnings" element={<EarningsPage />} />
            <Route path="provider/availability" element={<AvailabilityPage />} />
            <Route path="provider/profile" element={<ProviderProfileMgmt />} />
          </Route>
        </Route>

        {/* Admin Dashboard */}
        <Route element={<RoleProtectedRoute allowedRoles={['PLATFORM_ADMIN']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/users" element={<UserManagement />} />
            <Route path="admin/verification" element={<ProviderVerification />} />
            <Route path="admin/categories" element={<ServiceCategories />} />
            <Route path="admin/disputes" element={<AdminDisputes />} />
            <Route path="admin/analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        {/* Ops Dashboard */}
        <Route element={<RoleProtectedRoute allowedRoles={['OPERATIONS_MANAGER']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="ops" element={<OpsDashboard />} />
            <Route path="ops/bookings" element={<OpsBookings />} />
            <Route path="ops/assign" element={<OpsAssign />} />
            <Route path="ops/quality" element={<OpsQuality />} />
          </Route>
        </Route>

        {/* Support Dashboard */}
        <Route element={<RoleProtectedRoute allowedRoles={['SUPPORT_AGENT']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="support" element={<SupportDashboard />} />
            <Route path="support/disputes" element={<SupportDisputes />} />
          </Route>
        </Route>
      </Route>

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
