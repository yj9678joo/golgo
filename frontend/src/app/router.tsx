import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/features/auth/components/AuthGuard'
import { AuthCallbackPage } from '@/features/auth/pages/AuthCallbackPage'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { NicknamePage } from '@/features/auth/pages/NicknamePage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { BrokerSetupPage } from '@/features/onboarding/pages/BrokerSetupPage'
import { OnboardingPage } from '@/features/onboarding/pages/OnboardingPage'
import { DashboardPage } from '@/features/portfolio/pages/DashboardPage'
import { PortfolioDetailPage } from '@/features/portfolio/pages/PortfolioDetailPage'
import { ScreenshotReviewPage } from '@/features/portfolio/pages/ScreenshotReviewPage'
import { ScreenshotUploadPage } from '@/features/portfolio/pages/ScreenshotUploadPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
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
        element: <DashboardPage />,
      },
      {
        path: '/portfolio',
        element: <PortfolioDetailPage />,
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
      {
        path: '/portfolio/screenshot',
        element: <ScreenshotUploadPage />,
      },
      {
        path: '/portfolio/screenshot/:jobId',
        element: <ScreenshotReviewPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate replace to="/" />,
  },
])
