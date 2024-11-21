/*eslint-disable*/
import { useNavigate } from 'react-router-dom';
import SvgColor from '../../../components/svg-color';
import { useUser } from '../../../UserContext';

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const getNavConfig = () => {
  const navigate = useNavigate(); // Initialize useNavigate hook
  const { userType } = useUser();
  const { orgId } = useUser();

  if (userType === 'superAdmin') {
    return [
      {
        title: 'dashboard',
        path: '/dashboard/app',
        icon: icon('ic_analytics'),
      },
      {
        title: 'Organisations',
        path: '/dashboard/user',
        icon: icon('ic_user'),
      },
      {
        title: 'Learners',
        path: '/dashboard/Create-Users',
        icon: icon('ic_lan'),
      },
      {
        title: 'Report',
        path: '/dashboard/superreport',
        icon: icon('ic_lang'),
      },
      {
        title: 'User Report',
        path: '/dashboard/superuserreport',
        icon: icon('ic_lan'),
      },
      {
        title: 'Setting',
        path: '/dashboard/superpassword',
        icon: icon('ic_lan'),
      },
      
    ];
  }
  
  if (userType === 'orgAdmin') {
    return [
      {
        title: 'dashboards',
        path: `/org-dashboards/${orgId}/app`,
        icon: icon('ic_analytics'),
      },
      {
        title: 'Cohorts',
        path: `/org-dashboards/${orgId}/orgdashc`,
        icon: icon('ic_lang'),
      },
      {
        title: 'Learners',
        path: `/org-dashboards/${orgId}/org-Create-Users`,
        icon: icon('ic_Learners'),
      },
      {
          title: 'Programs',
          path: `/org-dashboards/${orgId}/programs`,
          icon: icon('ic_program'),
        },
      {
        title: 'Organisation Report',
        path: `/org-dashboards/${orgId}/orgreport`,
        icon: icon('ic_lang'),
      },
      {
        title: 'Setting',
        path: `/org-dashboards/${orgId}/appx`,
        icon: icon('ic_lang'),
      },
    ];
  }

  // Default action: navigate to the login page
  navigate('/login');
  return []; // Ensure the function returns an empty array if navigation to login occurs
};

export default getNavConfig;
/* eslint-enable */
