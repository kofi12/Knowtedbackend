import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CourseDetail } from './pages/CourseDetail';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';

export const router = createBrowserRouter([
  {
    path: '/login',
    Component: Auth,
  },

  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: 'course/:courseId',
        Component: CourseDetail,
      },
      {
        path: 'profile',
        Component: Profile,
      },
    ],
  },
]);