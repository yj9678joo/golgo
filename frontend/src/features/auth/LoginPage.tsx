import { ChevronRight, LockKeyhole, Sparkles, Target } from 'lucide-react'
import { getOAuthLoginUrl } from '@/lib/api'
import golgoLockup from '@/assets/golgo-lockup-wide.png'

const providers = [
  {
    id: 'naver',
    label: '네이버로 시작하기',
    className: 'bg-[#03C75A] text-white hover:bg-[#02b351]',
    icon: <NaverIcon />,
  },
  {
    id: 'google',
    label: 'Google로 계속하기',
    className: 'border border-[#E5E8EB] bg-white text-[#191F28] hover:bg-[#F7F8FA]',
    icon: <GoogleIcon />,
  },
] as const

const checkpoints = [
  { label: '소셜 인증', icon: LockKeyhole },
  { label: '목표 비중', icon: Target },
  { label: 'AI 리밸런싱', icon: Sparkles },
]

export function LoginPage() {
  return (
    <main className="min-h-screen bg-[#F2F4F6] text-[#191F28]">
      <section className="mx-auto grid min-h-screen w-full max-w-5xl items-center gap-8 px-5 py-8 lg:grid-cols-[1fr_400px]">
        <div className="hidden lg:block">
          <div className="max-w-xl">
            <img className="h-12 w-auto" src={golgoLockup} alt="Golgo" />
            <h1 className="mt-10 text-5xl font-semibold leading-[1.15] text-balance">
              자산을 <span className="text-[#00A37A]">고르게</span>,
              <br />
              종목을 <span className="text-[#00A37A]">고르게</span>.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[#4E5968]">
              소셜 로그인으로 시작해 증권사 연결, 포트폴리오 최신화, AI 리밸런싱
              가이드까지 이어갑니다.
            </p>
          </div>
        </div>

        <div className="mx-auto flex min-h-[720px] w-full max-w-[390px] flex-col rounded-[32px] border border-white/80 bg-[#F7F8FA] px-7 py-8 shadow-[0_24px_80px_rgba(25,31,40,0.14)] lg:min-h-[760px]">
          <div className="flex justify-center">
            <div className="h-1.5 w-20 rounded-full bg-[#DDE2E7]" />
          </div>

          <div className="flex flex-1 flex-col justify-center pb-10 pt-12">
            <img className="h-14 w-fit" src={golgoLockup} alt="Golgo" />
            <h2 className="mt-8 text-[34px] font-semibold leading-[1.18] text-balance">
              자산을 <span className="text-[#00A37A]">고르게</span>,
              <br />
              종목을 <span className="text-[#00A37A]">고르게</span>.
            </h2>
            <p className="mt-4 text-[15px] leading-6 text-[#4E5968]">
              AI 기반 리밸런싱 어드바이저
            </p>

            <div className="mt-8 grid grid-cols-3 gap-2">
              {checkpoints.map(({ label, icon: Icon }) => (
                <div
                  key={label}
                  className="rounded-[14px] border border-[#E5E8EB] bg-white px-3 py-4 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <Icon className="mx-auto size-5 text-[#00A37A]" aria-hidden="true" />
                  <p className="mt-2 text-[12px] font-semibold leading-4 text-[#4E5968]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-2.5">
            {providers.map((provider) => (
              <a
                key={provider.id}
                className={`flex h-[54px] items-center justify-center gap-2 rounded-[14px] px-4 text-[16px] font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition active:scale-[0.98] ${provider.className}`}
                href={getOAuthLoginUrl(provider.id)}
              >
                {provider.icon}
                <span>{provider.label}</span>
                <ChevronRight className="ml-auto size-4 opacity-50" aria-hidden="true" />
              </a>
            ))}

            <div className="flex h-[54px] items-center justify-center gap-2 rounded-[14px] bg-[#FEE500]/50 px-4 text-[16px] font-semibold text-[#8B7B00] opacity-80">
              <KakaoIcon />
              <span>카카오는 준비 중</span>
            </div>

            <p className="mt-3 text-center text-[12px] leading-5 text-[#8B95A1]">
              가입 시 서비스 이용약관과
              <br />
              개인정보 처리방침에 동의하게 됩니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function NaverIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M14.3 4v8.4L9.6 4H4v16h5.7v-8.4l4.7 8.4H20V4h-5.7z" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22 12.2c0-.8-.1-1.4-.2-2.1H12v4h5.7c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.9 3-4.6 3-7.6z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.6 7.9 22 12 22z"
      />
      <path
        fill="#FBBC05"
        d="M6.2 13.6c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V6.9H2.7C2 8.4 1.5 10.1 1.5 12s.5 3.6 1.2 5.1l3.5-2.7-1-.8z"
      />
      <path
        fill="#EA4335"
        d="M12 5.4c1.5 0 2.9.5 4 1.5l3-3C17.1 2.3 14.7 1.4 12 1.4 7.9 1.4 4.4 3.7 2.7 6.9l3.5 2.7C7 7.2 9.3 5.4 12 5.4z"
      />
    </svg>
  )
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6l-1.2 3.8c-.1.3.2.5.5.4l4.7-3.1c.4.1.9.1 1.3.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z" />
    </svg>
  )
}
