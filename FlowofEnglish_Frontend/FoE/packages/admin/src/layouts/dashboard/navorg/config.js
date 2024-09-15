import SvgColor from '../../../components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />;

const getNavConfig = (id) => {
  const config = [
    {
      title: 'dashboard',
      path: '/dashboard/app',
      icon: icon('ic_analytics'),
    },
    {
      title: 'Organisations',
      path: '/dashboard/usersx',
      icon: icon('ic_user'),
    },
    {
      title: 'Cohort',
      path: '/dashboard/cohorts',
      icon: icon('ic_course'),
    },
    {
      title: 'Programs',
      path: '/dashboard/Programs',
      icon: icon('ic_lang'),
    },
    // {
    //   title: 'Levels',
    //   path: '/dashboard/levels',
    //   icon: icon('ic_level'),
    // },
  ];
  // console.log(id);
  // Filter out "Courses" and "Organisations" if id is not present
  // if (id) {
  //   return config.filter((item) => item.title !== 'dashboard' && item.title !== 'Add course to org');
  // }

  return config;
};

export default getNavConfig;
