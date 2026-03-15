import { createBrowserRouter, redirect } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CourseDetail } from './pages/CourseDetail';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';

function requireAuthLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const hasTokenInQuery = url.searchParams.has('token');
  if (!localStorage.getItem('token') && !hasTokenInQuery) {
    throw redirect('/login?reason=auth-required');
  }
  return null;
}

function redirectIfAuthenticatedLoader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const hasTokenInQuery = url.searchParams.has('token');
  if (localStorage.getItem('token') || hasTokenInQuery) {
    throw redirect('/');
  }
  return null;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    loader: redirectIfAuthenticatedLoader,
    Component: Auth,
  },

  {
    path: '/',
    loader: requireAuthLoader,
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