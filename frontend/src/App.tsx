import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { AuthCallbackPage } from './features/auth/AuthCallbackPage'
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
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const hasTokens = useAuthStore((state) => state.hasTokens)
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    if (route === 'callback' || !hasTokens) {
      return
    }

    loadUser().then((loadedUser) => {
      setRoute(loadedUser ? 'nickname' : 'login')
    })
  }, [hasTokens, loadUser, route])

  useEffect(() => {
    if (status === 'anonymous') {
      setRoute('login')
    }
  }, [status])

  if (route === 'callback') {
    return <AuthCallbackPage onComplete={() => setRoute('nickname')} />
  }

  if (status === 'loading') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      </main>
    )
  }

  if (route === 'nickname' && user) {
    return <NicknamePage onDone={() => setRoute('home')} />
  }

  if (route === 'home' && user) {
    return <HomePage />
  }

  return <LoginPage />
}
