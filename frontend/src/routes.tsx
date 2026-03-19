import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CourseDetail } from './pages/CourseDetail';
import { DocumentBank } from './pages/DocumentBank';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { QuizSession } from './pages/QuizSession';
import { useAuth } from './context/AuthContext';
import Root from './components/Root';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function LoginRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Auth />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: 'login',
        element: <LoginRoute />,
      },
      {
        element: <Layout />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'course/:courseId', element: <CourseDetail /> },
              { path: 'course/:courseId/quiz/:aidId', element: <QuizSession /> },
              { path: 'documents', element: <DocumentBank /> },
              { path: 'profile', element: <Profile /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);