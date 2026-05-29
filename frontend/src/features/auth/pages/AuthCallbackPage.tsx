import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const hasHandledCallback = useRef(false)
  const [error, setError] = useState<string | null>(null)
  const setTokens = useAuthStore((state) => state.setTokens)
  const loadUser = useAuthStore((state) => state.loadUser)

  useEffect(() => {
    if (hasHandledCallback.current) {
      return
    }

    hasHandledCallback.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (!accessToken || !refreshToken) {
      const message = '소셜 인증 결과를 확인할 수 없습니다.'
      window.alert(`로그인 실패: ${message}`)
      setError(message)
      return
    }

    setTokens({ accessToken, refreshToken })
    window.history.replaceState(null, '', '/auth/callback')

    loadUser()
      .then((user) => {
        if (!user) {
          const message = '로그인 사용자 정보를 확인할 수 없습니다.'
          window.alert(`로그인 실패: ${message}`)
          setError(message)
          return
        }

        window.alert(
          [
            '로그인 성공',
            `닉네임: ${user.nickname}`,
            `이메일: ${user.email}`,
            `연결 Provider: ${user.connectedProviders.join(', ')}`,
          ].join('\n'),
        )
        navigate('/nickname', { replace: true })
      })
      .catch(() => {
        const message = '로그인 정보를 불러오지 못했습니다.'
        window.alert(`로그인 실패: ${message}`)
        setError(message)
      })
  }, [loadUser, navigate, setTokens])

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 text-foreground">
      <section className="w-full max-w-sm rounded-lg border border-border bg-card p-6 text-center shadow-sm">
        {error ? (
          <>
            <h1 className="text-xl font-semibold">로그인 처리 실패</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{error}</p>
            <a
              className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground"
              href="/login"
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
