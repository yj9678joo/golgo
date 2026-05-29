import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function AuthGuard() {
  const location = useLocation()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const hasTokens = useAuthStore((state) => state.hasTokens)
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    if (hasTokens && !user && status !== 'loading') {
      void loadUser()
    }
  }, [hasTokens, loadUser, status, user])

  if (!hasTokens || status === 'anonymous') {
    return <Navigate replace to="/login" state={{ from: location }} />
  }

  if (status === 'loading' || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="size-7 animate-spin text-primary" aria-hidden="true" />
      </main>
    )
  }

  return <Outlet />
}
