import React from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/ThemeProvider';
import { router } from './routes';

function hydrateTokenFromUrl() {
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
}

export default function App() {
  // Must run before RouterProvider mounts so loaders/contexts see the token.
  hydrateTokenFromUrl();

  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}