import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, LogOut } from 'lucide-react'
import { updateNickname } from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/features/auth/store/auth-store'

const nicknamePattern = /^[가-힣A-Za-z0-9]{2,12}$/

export function NicknamePage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const loadUser = useAuthStore((state) => state.loadUser)
  const signOut = useAuthStore((state) => state.signOut)
  const [nickname, setNickname] = useState(user?.nickname ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = nicknamePattern.test(nickname)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isValid) {
      setError('닉네임은 한글, 영문, 숫자 2~12자로 입력해 주세요.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await updateNickname(nickname)
      await loadUser()
      navigate('/', { replace: true })
    } catch {
      setError('닉네임을 저장하지 못했습니다. 중복 여부를 확인해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">계정 설정</p>
              <h1 className="mt-3 text-2xl font-semibold">닉네임을 확인해 주세요</h1>
            </div>
            <button
              className="inline-flex size-10 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-muted"
              type="button"
              onClick={() => void signOut().then(() => navigate('/login', { replace: true }))}
              aria-label="로그아웃"
            >
              <LogOut className="size-4" aria-hidden="true" />
            </button>
          </div>

          <form className="mt-6" onSubmit={handleSubmit}>
            <label className="text-sm font-medium" htmlFor="nickname">
              닉네임
            </label>
            <input
              className="mt-2 h-12 w-full rounded-md border border-border bg-background px-4 text-base outline-none transition focus:border-primary"
              id="nickname"
              maxLength={12}
              minLength={2}
              name="nickname"
              pattern="[가-힣A-Za-z0-9]{2,12}"
              value={nickname}
              onChange={(event) => setNickname(event.target.value.trim())}
              placeholder="고르고마스터"
            />
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="size-3.5 text-primary" aria-hidden="true" />
              <span>한글, 영문, 숫자만 사용할 수 있습니다.</span>
            </div>
            {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

            <button
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                '저장하고 계속하기'
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
