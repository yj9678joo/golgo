import { LockKeyhole, Sparkles, Target } from 'lucide-react'
import { getOAuthLoginUrl } from '@/lib/api/client'
import golgoLockup from '@/assets/golgo-lockup-wide.png'
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton'

const providers = [
  { provider: 'kakao', label: '카카오는 준비 중', disabled: true },
  { provider: 'naver', label: '네이버로 시작하기', href: getOAuthLoginUrl('naver') },
  { provider: 'google', label: 'Google로 계속하기', href: getOAuthLoginUrl('google') },
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
              <SocialLoginButton key={provider.provider} {...provider} />
            ))}

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
