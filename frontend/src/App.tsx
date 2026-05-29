import { useCallback, useState } from 'react'
import { AuthCallbackPage } from './features/auth/AuthCallbackPage'
import { AuthRoute } from './features/auth/AuthRoute'
import { HomePage } from './features/auth/HomePage'
import { LoginPage } from './features/auth/LoginPage'
import { NicknamePage } from './features/auth/NicknamePage'
import { useAuthStore } from './features/auth/auth-store'

type AppRoute = 'login' | 'callback' | 'nickname' | 'home'

function getInitialRoute(): AppRoute {
  if (window.location.pathname === '/auth/callback') {
    return 'callback'
  }

  return 'login'
}

export function App() {
  const [route, setRoute] = useState<AppRoute>(getInitialRoute)
  const user = useAuthStore((state) => state.user)

  const handleAuthenticated = useCallback(() => {
    setRoute((currentRoute) => (currentRoute === 'login' ? 'nickname' : currentRoute))
  }, [])

  const handleAnonymous = useCallback(() => {
    setRoute('login')
  }, [])

  if (route === 'callback') {
    return <AuthCallbackPage onComplete={() => setRoute('nickname')} />
  }

  return (
    <AuthRoute onAnonymous={handleAnonymous} onAuthenticated={handleAuthenticated}>
      {route === 'nickname' && user ? <NicknamePage onDone={() => setRoute('home')} /> : null}
      {route === 'home' && user ? <HomePage /> : null}
      {route === 'login' || !user ? <LoginPage /> : null}
    </AuthRoute>
  )
}
