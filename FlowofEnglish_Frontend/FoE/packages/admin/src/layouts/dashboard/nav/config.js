/*eslint-disable*/
import { useNavigate } from 'react-router-dom';
import SvgColor from '../../../components/svg-color';
import { useUser } from '../../../UserContext';

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const getNavConfig = () => {
  const navigate = useNavigate();
  const { userType } = useUser();
  const { orgId } = useUser();

  if (userType === 'superAdmin') {
    return [
      {
        title: 'dashboard',
        path: '/dashboard/app',
        icon: icon('dashboard'),
      },
      {
        title: 'Organizations',
        path: '/dashboard/user',
        icon: icon('organization'),
      },
      {
        title: 'Learners',
        path: '/dashboard/Create-Users',
        icon: icon('profile'),
      },
      {
        title: 'Programs',
        path: `/dashboard/programs`,
        icon: icon('program'),
      },
      {
        title: 'Program-Cohort',
        path: `/dashboard/program-to-cohort`,
        icon: icon('Pro2Coh'),
      },
      {
        title: 'Reports',
        path: '/dashboard/superreport',
        icon: icon('report'),
      },
      {
        title: 'Setting',
        path: '/dashboard/superpassword',
        icon: icon('setting'),
      },
    ];
  }

  if (userType === 'orgAdmin') {
    return [
      {
        title: 'dashboard',
        path: `/org-dashboards/${orgId}/app`,
        icon: icon('dashboard'),
      },
      {
        title: 'Cohorts',
        path: `/org-dashboards/${orgId}/orgdashc`,
        icon: icon('cohort'),
      },
      {
        title: 'Learners',
        path: `/org-dashboards/${orgId}/org-Create-Users`,
        icon: icon('profile'),
      },
      {
        title: 'Programs',
        path: `/org-dashboards/${orgId}/programs`,
        icon: icon('program'),
      },
      // {
      //   title: 'Payment',
      //   path: `/org-dashboards/${orgId}/payments`,
      //   icon: icon('program'),
      // },
      {
        title: 'Reports',
        path: `/org-dashboards/${orgId}/orgreport`,
        icon: icon('report'),
      },
      {
        title: 'Setting',
        path: `/org-dashboards/${orgId}/appx`,
        icon: icon('setting'),
      },
    ];
  }

  // Default action: navigate to the login page
  navigate('/login');
  return []; // Ensure the function returns an empty array if navigation to login occurs
};

export default getNavConfig;
/* eslint-enable */
