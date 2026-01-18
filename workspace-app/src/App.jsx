import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import MainLayout from './components/Layout/MainLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Work Module
import WorkDashboard from './pages/Work/Dashboard';
import Projects from './pages/Work/Projects';
import Notes from './pages/Work/Notes';
import Calendar from './pages/Work/Calendar';
import Reporting from './pages/Work/Reporting';
import WorkAssets from './pages/Work/Assets';
import Budget from './pages/Work/Budget';
import WorkSettings from './pages/Work/Settings';

// Space Module
import SpaceDashboard from './pages/Space/Dashboard';
import ProjectsPlan from './pages/Space/ProjectsPlan';
import Roadmap from './pages/Space/Roadmap';
import Targeting from './pages/Space/Targeting';
import SpaceCalendar from './pages/Space/Calendar';
import SpaceAssets from './pages/Space/Assets';
import SpaceBudget from './pages/Space/Budget';
import SpaceFinance from './pages/Space/Finance';
import SpaceSettings from './pages/Space/Settings';

// Social Module
import {
  Dashboard as SocialDashboard,
  SosmedPosting,
  SchedulePost,
  SosmedSettings,
  BlogPosting,
  BlogSettings,
  Settings as SocialSettings,
  SocialAnalytics
} from './pages/Social';

// Finance Module
import {
  FinanceDashboard,
  Saldo,
  Tagihan,
  Pemasukan,
  Pengeluaran,
  FinanceNotes,
  Laporan,
  FinanceSettings,
  FinanceAnalytics
} from './pages/Finance';

// Work Analytics
import WorkAnalytics from './pages/Work/Analytics';

// Assets Module
import {
  AssetsDashboard,
  AccountManagement,
  AssetManagement,
  AssetNotes,
  Bookmark
} from './pages/Assets';

// System Module
import SystemSettings from './pages/System/Settings';

// Landing Page
import LandingPage from './pages/LandingPage';

// Notifications
import { NotificationsPage } from './pages/Notifications';

// Collaboration
import { InvitationsPage, InviteAcceptPage } from './components/Collaboration';

// Placeholder
import PlaceholderPage from './pages/PlaceholderPage';

// Legal Pages
import { PrivacyPolicy, TermsOfService, SecurityPage, DynamicLegalPage } from './pages/Legal';

// Blog Pages (Public)
import { BlogList, BlogDetail } from './pages/Blog';

// Blog Admin Pages
import { BlogDashboard, BlogEditor, PageEditor, PagesList } from './pages/BlogAdmin';
import BlogLayout from './layouts/BlogLayout';

// About Page
import { AboutPage } from './pages/About';

// Settings
import {
  ProfileSettings,
  AccountSettings,
  AISettings,
  NotificationSettings,
  PreferencesSettings,
  SuggestFeature
} from './pages/Settings';

// Protected Route Component - blocks blog role from main app
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(139,92,246,0.3)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Block blog role from accessing main app features
  const userRole = user?.Role?.name?.toLowerCase();
  if (userRole === 'blog') {
    return <Navigate to="/blog-admin" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Smart Redirect - redirects based on user role
const SmartRedirect = () => {
  const { user } = useAuth();
  const userRole = user?.Role?.name?.toLowerCase();

  // Admin/Master Admin goes to System
  if (userRole === 'admin' || userRole === 'master_admin') {
    return <Navigate to="/system" replace />;
  }

  // Blog writers go to blog admin
  if (userRole === 'blog') {
    return <Navigate to="/blog-admin" replace />;
  }

  // Regular users go to Work
  return <Navigate to="/work" replace />;
};

// Blog Writer Route Component
const BlogRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.Role?.name?.toLowerCase();
  const hasBlogAccess = userRole === 'blog' || userRole === 'admin' || userRole === 'master_admin';

  if (!hasBlogAccess) {
    return <Navigate to="/work" replace />;
  }

  return children;
};

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 50%, #0f0f23 100%)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid rgba(139,92,246,0.3)',
            borderTopColor: '#8b5cf6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Landing Page - for unauthenticated users */}
      <Route path="/landing" element={<LandingPage />} />

      {/* Legal Pages - Public (Dynamic from API) */}
      <Route path="/privacy" element={<DynamicLegalPage />} />
      <Route path="/terms" element={<DynamicLegalPage />} />
      <Route path="/security" element={<DynamicLegalPage />} />

      {/* Blog Pages - Public */}
      <Route path="/blog" element={<BlogList />} />
      <Route path="/blog/:slug" element={<BlogDetail />} />

      {/* About Page - Public */}
      <Route path="/about" element={<AboutPage />} />

      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <SmartRedirect /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <SmartRedirect /> : <Register />} />
      <Route path="/forgot-password" element={isAuthenticated ? <SmartRedirect /> : <ForgotPassword />} />
      <Route path="/invite/:token" element={<ProtectedRoute><InviteAcceptPage /></ProtectedRoute>} />

      {/* Protected Routes - Check if blog writer */}
      <Route path="/" element={isAuthenticated ? <RootRedirect /> : <LandingPage />}>
        {/* Redirect root based on user role */}
        <Route index element={<SmartRedirect />} />

        {/* Work Module */}
        <Route path="work" element={<WorkDashboard />} />
        <Route path="work/projects" element={<Projects />} />
        <Route path="work/notes" element={<Notes />} />
        <Route path="work/calendar" element={<Calendar />} />
        <Route path="work/reporting" element={<Reporting />} />
        <Route path="work/assets" element={<WorkAssets />} />
        <Route path="work/budget" element={<Budget />} />
        <Route path="work/settings" element={<WorkSettings />} />
        <Route path="work/analytics" element={<WorkAnalytics />} />
        <Route path="work/invitations" element={<InvitationsPage />} />

        {/* Space Module */}
        <Route path="space" element={<SpaceDashboard />} />
        <Route path="space/projects-plan" element={<ProjectsPlan />} />
        <Route path="space/roadmap" element={<Roadmap />} />
        <Route path="space/targeting" element={<Targeting />} />
        <Route path="space/calendar" element={<SpaceCalendar />} />
        <Route path="space/assets" element={<SpaceAssets />} />
        <Route path="space/budget" element={<SpaceBudget />} />
        <Route path="space/finance" element={<SpaceFinance />} />
        <Route path="space/settings" element={<SpaceSettings />} />

        {/* Social Module */}
        <Route path="social" element={<SocialDashboard />} />
        <Route path="social/sosmed-posting" element={<SosmedPosting />} />
        <Route path="social/schedule-post" element={<SchedulePost />} />
        <Route path="social/blog-posting" element={<BlogPosting />} />
        <Route path="social/sosmed-settings" element={<SosmedSettings />} />
        <Route path="social/blog-settings" element={<BlogSettings />} />
        <Route path="social/settings" element={<SocialSettings />} />
        <Route path="social/analytics" element={<SocialAnalytics />} />

        {/* Finance Module */}
        <Route path="finance" element={<FinanceDashboard />} />
        <Route path="finance/saldo" element={<Saldo />} />
        <Route path="finance/tagihan" element={<Tagihan />} />
        <Route path="finance/pemasukan" element={<Pemasukan />} />
        <Route path="finance/pengeluaran" element={<Pengeluaran />} />
        <Route path="finance/notes" element={<FinanceNotes />} />
        <Route path="finance/laporan" element={<Laporan />} />
        <Route path="finance/settings" element={<FinanceSettings />} />
        <Route path="finance/analytics" element={<FinanceAnalytics />} />

        {/* Assets Module */}
        <Route path="assets" element={<AssetsDashboard />} />
        <Route path="assets/accounts" element={<AccountManagement />} />
        <Route path="assets/management" element={<AssetManagement />} />
        <Route path="assets/notes" element={<AssetNotes />} />
        <Route path="assets/bookmark" element={<Bookmark />} />

        {/* System Module - Admin Only */}
        <Route path="system" element={<AdminRoute><SystemSettings /></AdminRoute>} />
        <Route path="system/users" element={<AdminRoute><SystemSettings /></AdminRoute>} />
        <Route path="system/roles" element={<AdminRoute><SystemSettings /></AdminRoute>} />
        <Route path="system/activity" element={<AdminRoute><SystemSettings /></AdminRoute>} />
        <Route path="system/settings" element={<AdminRoute><SystemSettings /></AdminRoute>} />
        <Route path="system/security" element={<AdminRoute><SystemSettings /></AdminRoute>} />
        <Route path="system/integrations" element={<AdminRoute><SystemSettings /></AdminRoute>} />

        {/* Notifications */}
        <Route path="notifications" element={<NotificationsPage />} />

        {/* Settings */}
        <Route path="settings" element={<ProfileSettings />} />
        <Route path="settings/account" element={<AccountSettings />} />
        <Route path="settings/ai" element={<AISettings />} />
        <Route path="settings/notifications" element={<NotificationSettings />} />
        <Route path="settings/preferences" element={<PreferencesSettings />} />
        <Route path="settings/suggestions" element={<SuggestFeature />} />
      </Route>

      {/* Blog Admin Routes - Separate layout for blog writers */}
      <Route path="/blog-admin" element={<BlogRoute><BlogLayout /></BlogRoute>}>
        <Route index element={<BlogDashboard />} />
        <Route path="create" element={<BlogEditor />} />
        <Route path="edit/:id" element={<BlogEditor />} />
        <Route path="pages" element={<PagesList />} />
        <Route path="pages/:slug" element={<PageEditor />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Root Redirect Component - redirects blog users to blog-admin, others to main layout
const RootRedirect = () => {
  const { user } = useAuth();
  const userRole = user?.Role?.name?.toLowerCase();

  if (userRole === 'blog') {
    return <Navigate to="/blog-admin" replace />;
  }

  return <ProtectedRoute><MainLayout /></ProtectedRoute>;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
