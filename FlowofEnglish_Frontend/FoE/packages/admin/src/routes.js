/*eslint-disable*/
import { Navigate, useRoutes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute'; // Import the ProtectedRoute component
import ProtectedRouteOrg from './components/ProtectedRouteOrg';
import DashboardLayout from './layouts/dashboard';
import DashboardClientLayout from './layouts/dashboard/DashboardClientLayout';
import SimpleLayout from './layouts/simple';
import AddCtO from './pages/AddCtO';
import AddCtOc from './pages/AddCtOc';
import BlogPage from './pages/BlogPage';
import CohortPage from './pages/CohortPage';
import ContentPage from './pages/ContentPage';
import ProgramPage from './pages/ProgramPage';
import DashboardAppPage from './pages/DashboardAppPage';
import DashboardClientPage from './pages/DashboardClientPage';
import LanguagePage from './pages/LanguagePage';
import LevelPage from './pages/LevelPage';
import LoginPage from './pages/LoginPage';
import LoginOrg from './pages/LoginPageOrg';
import Page404 from './pages/Page404';
import ProductsPage from './pages/ProductsPage';
import ReportPage from './pages/ReportPage';
import UserDetailsPage from './pages/UserDetailsPage';
import UserPage from './pages/UserPage';
import UsersPage from './pages/UsersPage';
// import OrgDash from './pages/OrgDash';
import DashboardOrgClientPage from './pages/DashboardOrgClientPage';
import ForgotPassword from './pages/ForgotPassword';
import OrgCourses from './pages/OrgReport';
import SuperAdminCreate from './pages/SuperAdminCreate';
import UserPassword from './pages/UserPassword';
import SuperUserReport from './pages/UsersReport';
import CohortOrg from './pages/cohortsOrg';
import SuperAdminPassword from './pages/superAdminPassword';
import LoginUser from './pages/LoginPageUser';
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
        { path: 'addcto', element: <AddCtO /> },
        { path: 'addctoc/:organisationId', element: <AddCtOc /> },
        { path: 'programs', element: <ProgramPage /> },
        { path: 'contents/:id', element: <ContentPage /> },
        { path: 'languages', element: <LanguagePage /> },
        { path: 'levels/:id', element: <LevelPage /> },
        { path: 'cohorts/:id', element: <CohortPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'blog', element: <BlogPage /> },
        // { path: 'orgdash', element: <OrgDash /> },
        { path: 'superreport', element: <ReportPage /> },
        { path: 'superuserreport', element: <SuperUserReport /> },
        { path: 'superpassword', element: <SuperAdminPassword /> },
        { path: 'superadmincreate', element: <SuperAdminCreate /> },
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
        { path: 'users', element: <UsersPage /> },
        { path: 'userdetails/:user_id', element: <UserDetailsPage /> },
        // { path: 'orgdashxb', element: <orgDash /> },
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
        { path: 'usersx', element: <UsersPage /> },
        { path: 'userdetails/:user_id', element: <UserDetailsPage /> },
        // { path: 'orgdashxb', element: <orgDash /> },
        { path: 'orgdashc', element: <CohortOrg /> },
        { path: 'orgreport', element: <OrgCourses /> },
      ],
    },
    {
      path: 'loginorg',
      element: <LoginOrg />,
    },
    {
      path: 'loginUser',
      element: <LoginUser />,
    },
    {
      path: 'login',
      element: <LoginPage />,
    },
    {
      path: 'forgot',
      element: <ForgotPassword />,
    },
    {
      path: 'superadmincreatea',
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
