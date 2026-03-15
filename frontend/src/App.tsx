import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/ThemeProvider';
import { router } from './routes';

export default function App() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (!token) return;

    localStorage.setItem('token', token);

    // Remove auth artifacts from the URL once persisted.
    url.searchParams.delete('token');
    url.searchParams.delete('loggedIn');
    const query = url.searchParams.toString();
    const cleanUrl = `${url.pathname}${query ? `?${query}` : ''}${url.hash}`;
    window.history.replaceState({}, document.title, cleanUrl);
  }, []);

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}