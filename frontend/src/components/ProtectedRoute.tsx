import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from './context/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not logged in
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}