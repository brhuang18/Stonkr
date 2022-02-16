import { Icon } from '@iconify/react';
import pieChart2Fill from '@iconify/icons-eva/pie-chart-2-fill';
import peopleFill from '@iconify/icons-eva/people-fill';
import notifications from '@iconify/icons-eva/bell-fill';
import fileTextFill from '@iconify/icons-eva/file-text-fill';
import lockFill from '@iconify/icons-eva/lock-fill';
import personAddFill from '@iconify/icons-eva/person-add-fill';
import alertTriangleFill from '@iconify/icons-eva/alert-triangle-fill';

import watchlist from '@iconify/icons-eva/eye-fill';
import home from '@iconify/icons-eva/book-open-fill';
import screeners from '@iconify/icons-eva/funnel-fill';

// ----------------------------------------------------------------------

const getIcon = (name) => <Icon icon={name} width={22} height={22} />;

const sidebarConfig = [
  {
    title: 'Finance Home',
    path: '/dashboard/financehome',
    icon: getIcon(home)
  },
  {
    title: 'Portfolio',
    path: `/dashboard/portfolio/overview/me`,
    icon: getIcon(pieChart2Fill)
  },
  {
    title: 'Watchlist',
    path: '/dashboard/watchlist',
    icon: getIcon(watchlist)
  },
  {
    title: 'Screeners',
    path: '/dashboard/screeners',
    icon: getIcon(screeners)
  },
  {
    title: 'Explore',
    path: '/dashboard/explore',
    icon: getIcon(peopleFill)
  },
  {
    title: 'Notifications',
    path: '/dashboard/notifications',
    icon: getIcon(notifications)
  },
  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: getIcon(lockFill)
  // },
  // {
  //   title: 'register',
  //   path: '/register',
  //   icon: getIcon(personAddFill)
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: getIcon(alertTriangleFill)
  // }
];

export default sidebarConfig;
