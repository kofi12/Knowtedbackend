    // frontend/src/main.tsx
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import { RouterProvider } from 'react-router-dom'
    import { router } from './routes.tsx'
    import { ThemeProvider } from './components/ThemeProvider'
    import './index.css'
    import './styles/globals.css'

    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <ThemeProvider defaultTheme="system" storageKey="knowted-theme">
          <RouterProvider router={router} />
        </ThemeProvider>
      </React.StrictMode>
    )