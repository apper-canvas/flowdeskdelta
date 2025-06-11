import HomePage from '@/components/pages/HomePage';
import DashboardPage from '@/components/pages/DashboardPage';
import ContactsPage from '@/components/pages/ContactsPage';
import DealsPage from '@/components/pages/DealsPage';
import ActivitiesPage from '@/components/pages/ActivitiesPage';
import CalendarPage from '@/components/pages/CalendarPage';
export const routes = {
  home: {
    id: 'home',
label: 'Home',
    path: '/',
    icon: 'Home',
    component: HomePage
  },
  dashboard: {
    id: 'dashboard',
label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    component: DashboardPage
  },
  contacts: {
    id: 'contacts',
    label: 'Contacts',
label: 'Contacts',
    path: '/contacts',
    icon: 'Users',
    component: ContactsPage
  },
  deals: {
    id: 'deals',
id: 'deals',
    label: 'Deals',
    path: '/deals',
    icon: 'DollarSign',
    component: DealsPage
  },
activities: {
    id: 'activities',
    label: 'Activities',
    path: '/activities',
    icon: 'Clock',
    component: ActivitiesPage
  },
  calendar: {
    id: 'calendar',
    label: 'Calendar',
    path: '/calendar',
    icon: 'Calendar',
    component: CalendarPage
  }
};

export const routeArray = Object.values(routes).filter(route => route.id !== 'home');