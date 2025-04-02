/*eslint-disable*/
import { Navigate, useRoutes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedRouteOrg from './components/ProtectedRouteOrg';
import DashboardLayout from './layouts/dashboard';
import DashboardClientLayout from './layouts/dashboard/DashboardClientLayout';
import SimpleLayout from './layouts/simple';
import AddCtOc from './pages/AddCtOc';
import BlogPage from './pages/BlogPage';
import CohortPage from './pages/CohortPage';
// import PaymentUI from './pages/PaymentUI';
import ProgramPage from './pages/ProgramPage';
import CohortPrograms from './pages/CohortPrograms';
import DashboardAppPage from './pages/DashboardAppPage';
import DashboardClientPage from './pages/DashboardClientPage';
import LoginPage from './pages/LoginPage';
import LoginPageOrg from './pages/LoginPageOrg';
import Page404 from './pages/Page404';
import ReportPage from './pages/ReportPage';
import UserDetailsPage from './pages/UserDetailsPage';
import UserPage from './pages/UserPage';
import UserCreate from './pages/UserCreate';
import UserCohortpage from './pages/UserCohortpage';
import OrgUserCreate from './pages/OrgUserCreate';
import DashboardOrgClientPage from './pages/DashboardOrgClientPage';
import ForgotPasswordx from './components/ForgotPasswordx';
import OrgCourses from './pages/OrgReport';
import SuperAdminCreate from './pages/SuperAdminCreate';
import UserPassword from './pages/UserPassword';
import SuperUserReport from './pages/UsersReport';
import OrgCohort from './pages/OrgCohort';
import SuperAdminPassword from './pages/superAdminPassword';
import OrgProgramPage from './pages/OrgProgramPage';
export default function Router() {
  const routes = useRoutes([
    {
      path: '/dashboard',
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: 'app', element: <DashboardAppPage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'Create-Users', element: <UserCreate /> },
        { path: 'programs', element: <ProgramPage /> },
        { path: 'program-to-cohort', element: <CohortPrograms />},
        { path: 'user-cohort/:organizationId/:cohortId', element: <UserCohortpage /> },
        { path: 'superreport', element: <ReportPage /> },
        { path: 'superuserreport', element: <SuperUserReport /> },
        { path: 'superpassword', element: <SuperAdminPassword /> },
        { path: 'superadmincreate', element: <SuperAdminCreate /> },


        { path: 'blog', element: <BlogPage /> },
        { path: 'addctoc/:organisationId', element: <AddCtOc /> },
        
        
      ],
    },
    {
      path: '/org-dashboard/:id',
      element: (
        <ProtectedRoute>
          <DashboardClientLayout />
        </ProtectedRoute>
      ),
      children: [
        { element: <Navigate to="/org-dashboard/:id/app" />, index: true },
        { path: 'app', element: <DashboardClientPage /> },
        { path: 'cohorts/organization/:organizationId', element: <CohortPage /> },
        { path: 'userdetails/:user_id', element: <UserDetailsPage /> },
        { path: 'users', element: <UserCreate /> },
        
      ],
    },
    {
      path: '/org-dashboards/:id',
      element: (
        <ProtectedRouteOrg>
          <DashboardClientLayout />
        </ProtectedRouteOrg>
      ),
      children: [
        { element: <Navigate to="/org-dashboards/:id/app" />, index: true },
        { path: 'app', element: <DashboardOrgClientPage /> },
        { path: 'appx', element: <UserPassword /> },
        { path: 'org-Create-Users', element: <OrgUserCreate /> },
        { path: 'programs', element: <OrgProgramPage />},
      //  { path: 'payments', element: <PaymentUI/>},
        { path: 'userdetails/:user_id', element: <UserDetailsPage /> },
        { path: 'orgdashc', element: <OrgCohort /> },
        { path: 'user-cohort/:organizationId/:cohortId', element: <UserCohortpage /> },
        { path: 'orgreport', element: <OrgCourses /> },
      ],
    },
    {
      path: 'loginorg',
      element: <LoginPageOrg />,
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'forgot',
      element: <ForgotPasswordx />,
    },
    {
      path: 'superadmincreate',
      element: <SuperAdminCreate />,
    },
    {
      element: <SimpleLayout />,
      children: [
        { element: <Navigate to="/dashboard/app" />, index: true },
        { path: '404', element: <Page404 /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);

  return routes;
}
/* eslint-enable */
