import { Button } from '@/components/ui/button'
import googleLoginImage from '@/assets/google_login.png'
import naverLoginImage from '@/assets/NAVER_login.png'

type SocialProvider = 'kakao' | 'naver' | 'google'

type SocialLoginButtonProps = {
  provider: SocialProvider
  label: string
  href?: string
  disabled?: boolean
}

const providerImages: Partial<Record<SocialProvider, string>> = {
  google: googleLoginImage,
  naver: naverLoginImage,
}

export function SocialLoginButton({
  provider,
  label,
  href,
  disabled = false,
}: SocialLoginButtonProps) {
  const image = providerImages[provider]

  if (href && !disabled) {
    return (
      <Button
        asChild
        className="h-auto w-full overflow-hidden rounded-[14px] bg-transparent p-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:bg-transparent active:scale-[0.98]"
        size="lg"
      >
        <a href={href} aria-label={label}>
          {image ? (
            <img className="block h-auto w-full" src={image} alt="" />
          ) : (
            <span>{label}</span>
          )}
        </a>
      </Button>
    )
  }

  return (
    <Button
      className="h-[54px] w-full rounded-[14px] bg-[#FEE500]/50 text-base font-semibold text-[#8B7B00] opacity-80"
      disabled
      size="lg"
      type="button"
    >
      <KakaoIcon />
      <span>{label}</span>
    </Button>
  )
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden="true">
      <path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.7 6.6l-1.2 3.8c-.1.3.2.5.5.4l4.7-3.1c.4.1.9.1 1.3.1 5.5 0 10-3.5 10-7.8S17.5 3 12 3z" />
    </svg>
  )
}
