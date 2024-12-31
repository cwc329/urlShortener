import { useState, useEffect } from 'react'
import { AuthChangeRedirector, AnonymousRoute, AuthenticatedRoute } from './auth'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'
import Dashboard from './Dashboard'
import Login from './account/Login'
import RequestLoginCode from './account/RequestLoginCode'
import ConfirmLoginCode from './account/ConfirmLoginCode'
import Logout from './account/Logout'
import Signup from './account/Signup'
import ProviderSignup from './socialaccount/ProviderSignup'
import ProviderCallback from './socialaccount/ProviderCallback'
import Home from './Home'
import ChangeEmail from './account/ChangeEmail'
import ManageProviders from './socialaccount/ManageProviders'
import Sessions from './usersessions/Sessions'
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
          element: <Home />
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
          path: '/account/login/code',
          element: <AnonymousRoute><RequestLoginCode /></AnonymousRoute>
        },
        {
          path: '/account/login/code/confirm',
          element: <AnonymousRoute><ConfirmLoginCode /></AnonymousRoute>
        },
        {
          path: '/account/email',
          element: <AuthenticatedRoute><ChangeEmail /></AuthenticatedRoute>
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
        {
          path: '/account/sessions',
          element: <AuthenticatedRoute><Sessions /></AuthenticatedRoute>
        }
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
