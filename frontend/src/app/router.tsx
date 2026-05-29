import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage'
import { HomePage } from '@/features/auth/pages/HomePage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { NicknamePage } from '@/features/auth/pages/NicknamePage'
import { BrokerSetupPage } from '@/features/onboarding/pages/BrokerSetupPage'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/nickname',
        element: <NicknamePage />,
      },
      {
        path: '/onboarding',
        element: <OnboardingPage />,
      },
      {
        path: '/broker-setup',
        element: <BrokerSetupPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
])
