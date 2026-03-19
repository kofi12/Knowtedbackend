import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { CourseDetail } from './pages/CourseDetail';
import { Auth } from './pages/Auth';
import { Profile } from './pages/Profile';
import { useAuth } from "./context/AuthContext";
import Root from './components/Root';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,               // ← provides AuthProvider to all routes
    children: [
      {
        path: 'login',
        element: <Auth />,
      },
      {
        element: <Layout />,
        children: [
          {
            element: <ProtectedRoute />,
            children: [
              { index: true, element: <Dashboard /> },
              { path: 'course/:courseId', element: <CourseDetail /> },
              { path: 'profile', element: <Profile /> },
            ],
          },
        ],
      },
    ],
  },
  // catch-all if needed
  { path: '*', element: <Navigate to="/" replace /> },
]);