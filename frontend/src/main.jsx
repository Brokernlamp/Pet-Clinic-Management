import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './pages/App.jsx'
import CRM from './pages/CRM.jsx'
import Customer from './pages/Customer.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/crm/*', element: <CRM /> },
  { path: '/customer/*', element: <Customer /> },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)


