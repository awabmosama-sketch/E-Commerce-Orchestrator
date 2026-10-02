import { createBrowserRouter, Navigate } from 'react-router-dom'
import { auth } from './api/axios'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Tickets from './pages/Tickets'
import TicketView from './pages/TicketView'
import Settings from './pages/Settings'

function RequireAuth() {
  return auth.token() ? <Layout /> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'tickets', element: <Tickets /> },
      { path: 'tickets/:id', element: <TicketView /> },
      { path: 'settings', element: <Settings /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])