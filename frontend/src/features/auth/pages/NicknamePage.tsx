import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Loader2, LogOut } from 'lucide-react'
import { MobilePage } from '@/components/layout/MobilePage'
import { updateNickname } from '@/features/auth/api/auth-api'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { OnboardingStepBar } from '@/features/onboarding/components/OnboardingStepBar'

const nicknamePattern = /^[가-힣A-Za-z0-9]{2,12}$/
const nicknameSuggestions = ['투자초보', '오늘도매수', '복리의힘']

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
      navigate('/onboarding', { replace: true })
    } catch {
      setError('닉네임을 저장하지 못했습니다. 중복 여부를 확인해 주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4">
        <OnboardingStepBar current={1} total={4} />

        <div className="mt-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-[26px] font-semibold leading-[1.25] text-[#191F28]">
              어떻게
              <br />
              불러드릴까요?
            </h1>
            <p className="mt-2 text-[14px] leading-6 text-[#6B7684]">
              포트폴리오에 표시되는 이름이에요
            </p>
          </div>
          <button
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-[#E5E8EB] bg-white text-[#6B7684]"
            type="button"
            onClick={() => void signOut().then(() => navigate('/login', { replace: true }))}
            aria-label="로그아웃"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>

        <form className="mt-7 flex flex-1 flex-col" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="nickname">
            닉네임
          </label>
          <div className="relative">
            <input
              className="h-14 w-full rounded-[16px] border border-[#191F28] bg-white px-4 pr-14 text-[18px] font-semibold text-[#191F28] outline-none transition focus:border-[#00A37A]"
              id="nickname"
              maxLength={12}
              minLength={2}
              name="nickname"
              pattern="[가-힣A-Za-z0-9]{2,12}"
              value={nickname}
              onChange={(event) => setNickname(event.target.value.trim())}
              placeholder="닉네임 입력"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#8B95A1]">
              {nickname.length}/12
            </span>
          </div>
          <div
            className={
              nickname && !isValid
                ? 'mt-2 flex items-center gap-1.5 text-[12px] leading-5 text-red-600'
                : 'mt-2 flex items-center gap-1.5 text-[12px] leading-5 text-[#8B95A1]'
            }
          >
            <Check className="size-3.5 text-[#00A37A]" aria-hidden="true" />
            <span>한글·영문·숫자 2~12자로 입력해 주세요</span>
          </div>
          {error ? <p className="mt-3 text-[13px] leading-5 text-red-600">{error}</p> : null}

          <div className="mt-5 grid gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-normal text-[#8B95A1]">
              추천 닉네임
            </p>
            <div className="flex flex-wrap gap-1.5">
              {nicknameSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  className="h-9 rounded-full border border-[#E5E8EB] bg-white px-3.5 text-[13px] font-medium text-[#4E5968]"
                  type="button"
                  onClick={() => setNickname(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1" />

          <button
            className="mt-8 inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#191F28] px-4 text-[15px] font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-35"
            type="submit"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              '다음'
            )}
          </button>
        </form>
      </div>
    </MobilePage>
  )
}
