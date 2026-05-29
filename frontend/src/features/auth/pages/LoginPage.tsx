import { MobilePage } from '@/components/layout/MobilePage'
import { getOAuthLoginUrl } from '@/lib/api/client'
import logo from '@/assets/golgo-logo.png'
import { SocialLoginButton } from '@/features/auth/components/SocialLoginButton'

const providers = [
  // { provider: 'kakao', label: '카카오는 준비 중', disabled: true },
  {
    provider: 'naver',
    label: '네이버로 시작하기',
    href: getOAuthLoginUrl('naver'),
  },
  {
    provider: 'google',
    label: 'Google로 계속하기',
    href: getOAuthLoginUrl('google'),
  },
] as const

export function LoginPage() {
  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px] items-center"
    >
      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-[390px] flex-col rounded-[24px] bg-[#F7F8FA] px-4 py-4 sm:min-h-[720px] sm:rounded-[32px] sm:border sm:border-white/80 sm:px-7 sm:py-8 sm:shadow-[0_24px_80px_rgba(25,31,40,0.14)]">
        <div className="hidden justify-center sm:flex">
          <div className="h-1.5 w-20 rounded-full bg-[#DDE2E7]" />
        </div>

        <div className="flex flex-1 flex-col justify-center pb-8 pt-8 sm:pb-12 sm:pt-16">
          <BrandLogo size="lg" />
          <h2 className="mt-7 text-[28px] font-semibold leading-[1.15] text-balance min-[375px]:text-[30px] sm:mt-10 sm:text-[34px] sm:leading-[1.18]">
            자산을 <span className="text-[#00A37A]">고르게</span>,
            <br />
            종목을 <span className="text-[#00A37A]">고르게</span>.
          </h2>
          <p className="mt-3 text-[14px] leading-6 text-[#4E5968] sm:mt-4 sm:text-[15px]">
            AI 기반 리밸런싱 어드바이저
          </p>
        </div>

        <div className="grid gap-2">
          {providers.map((provider) => (
            <SocialLoginButton key={provider.provider} {...provider} />
          ))}

          <p className="mt-2 text-center text-[11px] leading-5 text-[#8B95A1] min-[375px]:mt-3 min-[375px]:text-[12px]">
            가입 시 서비스 이용약관과
            <br />
            개인정보 처리방침에 동의하게 됩니다.
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
      <span className={`${textSize} font-semibold tracking-normal text-[#191F28]`}>
        고르고
      </span>
    </div>
  )
}
