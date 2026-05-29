import { ReactNode, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from './auth-store'

type AuthRouteProps = {
  children: ReactNode
  onAnonymous: () => void
  onAuthenticated: () => void
}

export function AuthRoute({ children, onAnonymous, onAuthenticated }: AuthRouteProps) {
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const hasTokens = useAuthStore((state) => state.hasTokens)
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    if (!hasTokens) {
      onAnonymous()
      return
    }

    if (user) {
      onAuthenticated()
      return
    }

    if (status === 'loading') {
      return
    }

    loadUser().then((loadedUser) => {
      if (loadedUser) {
        onAuthenticated()
        return
      }

      onAnonymous()
    })
  }, [hasTokens, loadUser, onAnonymous, onAuthenticated, status, user])

  if (status === 'loading' || (hasTokens && !user)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      </main>
    )
  }

  return children
}
