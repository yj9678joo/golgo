import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from './auth-store'

type AuthCallbackPageProps = {
  onComplete: () => void
}

export function AuthCallbackPage({ onComplete }: AuthCallbackPageProps) {
  const [error, setError] = useState<string | null>(null)
  const setTokens = useAuthStore((state) => state.setTokens)
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (!accessToken || !refreshToken) {
      setError('소셜 인증 결과를 확인할 수 없습니다.')
      return
    }

    setTokens({ accessToken, refreshToken })
    window.history.replaceState(null, '', '/auth/callback')

    loadUser().then(onComplete).catch(() => {
      setError('로그인 정보를 불러오지 못했습니다.')
    })
  }, [loadUser, onComplete, setTokens])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-semibold">로그인 처리 실패</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
            <a
              className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
              href="/"
            >
              다시 로그인
            </a>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto size-7 animate-spin text-primary" aria-hidden="true" />
            <h1 className="mt-5 text-xl font-semibold">로그인 정보를 확인 중입니다</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              인증이 완료되면 계정 설정 화면으로 이동합니다.
            </p>
          </>
        )}
      </section>
    </main>
  )
}
