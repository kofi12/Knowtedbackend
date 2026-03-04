import React from 'react';
import { RouterProvider } from 'react-router';
import { ThemeProvider } from './components/ThemeProvider';
import { router } from './routes';

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}