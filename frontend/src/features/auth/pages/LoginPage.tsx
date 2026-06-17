import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MobilePage } from '@/components/layout/MobilePage'
import logo from '@/assets/golgo-logo.png'
import { useAuthStore } from '@/features/auth/store/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const loginWithPassword = useAuthStore((state) => state.loginWithPassword)
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleDirectLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError(null)
    setIsSubmitting(true)

    try {
      await loginWithPassword(loginId, password)
      navigate('/onboarding', { replace: true })
    } catch {
      const message = '아이디 또는 비밀번호를 확인해 주세요.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px] items-center"
    >
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[390px] flex-col rounded-[24px] bg-[#F7F8FA] px-4 py-4 sm:min-h-[700px] sm:rounded-[28px] sm:border sm:border-white/80 sm:px-7 sm:py-8 sm:shadow-[0_18px_56px_rgba(25,31,40,0.10)]">
        <div className="flex flex-1 flex-col justify-center pb-8 pt-8 sm:pb-10 sm:pt-10">
          <BrandLogo size="lg" />
          <h2 className="mt-7 text-[28px] font-semibold leading-[1.15] text-balance min-[375px]:text-[30px] sm:mt-10 sm:text-[34px] sm:leading-[1.18]">
            자산을 <span className="text-[#03ba8c]">고르게</span>,
            <br />
            종목을 <span className="text-[#03ba8c]">고르게</span>.
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-[#4E5968] sm:mt-4 sm:text-[15px]">
            AI 기반 리밸런싱 어드바이저
          </p>
        </div>

        <div className="grid gap-2.5">
          <form
            className="rounded-[18px] border border-[#E5E8EB] bg-white p-4 shadow-sm"
            onSubmit={handleDirectLogin}
          >
            <div className="grid gap-2.5">
              <label className="grid gap-1.5 text-[12px] font-medium text-[#4E5968]">
                아이디
                <input
                  className="h-11 rounded-[12px] border border-[#DDE2E7] bg-[#F7F8FA] px-3 text-[15px] text-[#191F28] outline-none transition focus:border-[#03ba8c] focus:bg-white"
                  name="loginId"
                  value={loginId}
                  onChange={(event) => setLoginId(event.target.value)}
                  autoComplete="username"
                />
              </label>
              <label className="grid gap-1.5 text-[12px] font-medium text-[#4E5968]">
                비밀번호
                <input
                  className="h-11 rounded-[12px] border border-[#DDE2E7] bg-[#F7F8FA] px-3 text-[15px] text-[#191F28] outline-none transition focus:border-[#03ba8c] focus:bg-white"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                />
              </label>
            </div>

            {error ? (
              <p className="mt-3 text-[12px] leading-5 text-red-600">{error}</p>
            ) : null}

            <button
              className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-[14px] bg-[#03ba8c] px-4 text-[14px] font-semibold text-white transition hover:bg-[#02a77e] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>
            <button
              className="mt-2 h-10 w-full text-[13px] font-semibold text-[#03ba8c] transition hover:text-[#02a77e]"
              type="button"
              onClick={() => navigate('/register')}
            >
              회원가입
            </button>
          </form>

          <p className="mt-2 text-center text-[11px] leading-5 text-[#8B95A1] min-[375px]:mt-3 min-[375px]:text-[12px]">
            가입 시 <a className="font-semibold text-[#03ba8c] underline-offset-2 visited:text-[#028765] hover:underline" href="/terms">서비스 이용약관</a>과
            <br />
            <a className="font-semibold text-[#03ba8c] underline-offset-2 visited:text-[#028765] hover:underline" href="/privacy">개인정보 처리방침</a>에 동의하게 됩니다.
          </p>
        </div>
      </div>
    </MobilePage>
  )
}

function BrandLogo({ size = 'default' }: { size?: 'default' | 'lg' }) {
  const markSize = size === 'lg' ? 'size-16' : 'size-10'
  const textSize = size === 'lg' ? 'text-3xl' : 'text-2xl'

  return (
    <div className="flex items-center gap-2.5">
      <img className={markSize} src={logo} alt="" />
      <span
        className={`${textSize} font-semibold tracking-normal text-[#191F28]`}
      >
        고르고
      </span>
    </div>
  )
}
