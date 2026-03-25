import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

export default function Root() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}