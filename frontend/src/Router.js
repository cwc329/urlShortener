import { useState, useEffect } from 'react'
import { AuthChangeRedirector, AnonymousRoute, AuthenticatedRoute } from './auth'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import Dashboard from './Dashboard'
import Login from './account/Login'
import Logout from './account/Logout'
import Signup from './account/Signup'
import ProviderSignup from './socialaccount/ProviderSignup'
import ProviderCallback from './socialaccount/ProviderCallback'
import Home from './Home'
import ManageProviders from './socialaccount/ManageProviders'
import Root from './Root'
import { useConfig } from './auth/hooks'

function createRouter(config) {
  return createBrowserRouter([
    {
      path: '/',
      element: <AuthChangeRedirector><Root /></AuthChangeRedirector>,
      children: [
        {
          path: '/',
          element: <AuthenticatedRoute><Home /></AuthenticatedRoute>,
        },
        {
          path: '/dashboard',
          element: <AuthenticatedRoute><Dashboard /></AuthenticatedRoute>
        },
        {
          path: '/account/login',
          element: <AnonymousRoute><Login /></AnonymousRoute>
        },
        {
          path: '/account/logout',
          element: <Logout />
        },
        {
          path: '/account/provider/callback',
          element: <ProviderCallback />
        },
        {
          path: '/account/provider/signup',
          element: <AnonymousRoute><ProviderSignup /></AnonymousRoute>
        },
        {
          path: '/account/providers',
          element: <AuthenticatedRoute><ManageProviders /></AuthenticatedRoute>
        },
        {
          path: '/account/signup',
          element: <AnonymousRoute><Signup /></AnonymousRoute>
        },
      ]
    }
  ])
}

export default function Router() {
  // If we create the router globally, the loaders of the routes already trigger
  // even before the <AuthContext/> trigger the initial loading of the auth.
  // state.
  const [router, setRouter] = useState(null)
  const config = useConfig()
  useEffect(() => {
    setRouter(createRouter(config))
  }, [config])
  return router ? <RouterProvider router={router} /> : null
}
