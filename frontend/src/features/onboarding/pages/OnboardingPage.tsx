import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ImageUp } from 'lucide-react'
import { MobilePage } from '@/components/layout/MobilePage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { OnboardingStepBar } from '@/features/onboarding/components/OnboardingStepBar'
import { SelectableOption } from '@/features/onboarding/components/SelectableOption'
import { useAuthStore } from '@/features/auth/store/auth-store'
import { personaOptions } from '@/features/onboarding/data/onboarding-options'
import type {
  InvestmentPersona,
  OnboardingStep,
} from '@/features/onboarding/types'

const personaLabels: Record<InvestmentPersona, string> = {
  conservative: '안정형',
  balanced: '안정 성장형',
  growth: '성장형',
  custom: '직접 설정',
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const finishOnboarding = useAuthStore((state) => state.finishOnboarding)
  const [step, setStep] = useState<OnboardingStep>('persona')
  const [persona, setPersona] = useState<InvestmentPersona>('balanced')
  const [isCompleting, setIsCompleting] = useState(false)
  const [completionError, setCompletionError] = useState<string | null>(null)

  const complete = async () => {
    setIsCompleting(true)
    setCompletionError(null)

    try {
      await finishOnboarding()
      setStep('done')
    } catch {
      setCompletionError('온보딩 설정을 저장하지 못했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      {step === 'persona' ? (
        <OnboardingFrame>
          <OnboardingStepBar current={2} total={3} />
          <OnboardingHeading
            title={
              <>
                어떤 투자 성향을
                <br />
                가지고 계신가요?
              </>
            }
            description="선택한 성향에 맞춰 대시보드 구성을 준비해요"
          />
          <div className="grid gap-2.5">
            {personaOptions.map((option) => (
              <SelectableOption
                key={option.id}
                icon={option.icon}
                title={option.label}
                description={option.description}
                selected={persona === option.id}
                onClick={() => setPersona(option.id)}
              />
            ))}
          </div>
          <div className="mt-auto grid gap-2 pt-5 sm:mt-7">
            <Button
              className="inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white transition hover:bg-[#02a77e]"
              type="button"
              onClick={() => setStep('broker')}
            >
              다음
            </Button>
            <Button
              className="h-11 bg-transparent px-0 text-[14px] font-semibold text-[#8B95A1] hover:bg-transparent"
              type="button"
              variant="ghost"
              onClick={() => {
                setPersona('balanced')
                setStep('broker')
              }}
            >
              나중에 설정할게요
            </Button>
          </div>
        </OnboardingFrame>
      ) : null}

      {step === 'broker' ? (
        <OnboardingFrame>
          <OnboardingStepBar current={3} total={3} />
          <Button
            className="mb-2 inline-flex h-10 w-fit items-center gap-1.5 rounded-[12px] bg-white px-3 text-[13px] font-semibold text-[#4E5968]"
            type="button"
            variant="outline"
            onClick={() => setStep('persona')}
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            이전 단계 수정
          </Button>
          <OnboardingHeading
            title={
              <>
                MTS 캡처로
                <br />
                시작해볼게요
              </>
            }
            description="보유 종목 화면 캡처 업로드는 다음 단계에서 이어갈 수 있어요"
          />
          <Card className="rounded-[20px] border border-dashed border-[#B0B8C1] bg-white p-5 text-center shadow-none">
            <div className="mx-auto flex size-15 items-center justify-center rounded-[18px] bg-[#E9FBF6] text-[#03ba8c]">
              <ImageUp className="size-7" aria-hidden="true" />
            </div>
            <p className="mt-4 text-[16px] font-semibold text-[#191F28]">
              보유 종목 캡처 업로드
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#6B7684]">
              지금은 온보딩 완료 여부만 저장하고 캡처 파일은 저장하지 않아요.
            </p>
          </Card>
          <Card className="mt-4 grid gap-2 rounded-[16px] border-0 bg-white p-3.5 shadow-none">
            <p className="text-[12px] font-semibold text-[#8B95A1]">고도화 예정</p>
            <p className="text-[12px] leading-5 text-[#4E5968]">
              증권사 계좌 연결과 MTS 캡처 데이터 연동은 이후 포트폴리오 연동 단계에서 연결합니다.
            </p>
          </Card>
          <div className="mt-auto grid gap-2 pt-5 sm:mt-7">
            {completionError ? (
              <p className="text-center text-[13px] font-semibold text-[#E5484D]">
                {completionError}
              </p>
            ) : null}
            <Button
              className="inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white transition hover:bg-[#02a77e]"
              type="button"
              onClick={() => void complete()}
              disabled={isCompleting}
            >
              {isCompleting ? '저장 중...' : '고르고 시작하기'}
            </Button>
            <Button
              className="h-11 bg-transparent px-0 text-[14px] font-semibold text-[#8B95A1] hover:bg-transparent"
              type="button"
              variant="ghost"
              onClick={() => void complete()}
              disabled={isCompleting}
            >
              캡처는 나중에 업로드할게요
            </Button>
          </div>
        </OnboardingFrame>
      ) : null}

      {step === 'done' ? (
        <OnboardingFrame>
          <div className="flex flex-1 flex-col items-center justify-center pt-4 text-center sm:justify-start sm:pt-28">
            <div className="mb-6 flex size-20 items-center justify-center rounded-[24px] bg-[#03ba8c] text-white shadow-sm">
              <Check className="size-9" aria-hidden="true" />
            </div>
            <h1 className="text-[27px] font-semibold leading-[1.25] text-[#191F28]">
              준비 완료!
              <br />
              이제 고르고를
              <br />
              시작해볼게요
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-[#6B7684]">
              선택한 설정을 기준으로 대시보드를 준비했어요
            </p>
            <Card className="mt-6 w-full rounded-[18px] border-0 bg-white p-4 text-left shadow-none">
              <SummaryRow label="투자 성향" value={personaLabels[persona]} />
              <SummaryRow label="연동 방식" value="MTS 캡처 업로드" />
            </Card>
          </div>
          <Button
            className="inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white transition hover:bg-[#02a77e]"
            type="button"
            onClick={() => navigate('/', { replace: true })}
          >
            대시보드 보러가기
          </Button>
        </OnboardingFrame>
      ) : null}
    </MobilePage>
  )
}

function OnboardingFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4 sm:min-h-[700px]">
      {children}
    </div>
  )
}

function OnboardingHeading({
  title,
  description,
}: {
  title: React.ReactNode
  description: string
}) {
  return (
    <header className="mb-6 mt-5">
      <h1 className="text-[26px] font-semibold leading-[1.25] text-[#191F28]">
        {title}
      </h1>
      <p className="mt-2 text-[14px] leading-6 text-[#6B7684]">{description}</p>
    </header>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F2F4F6] py-3 first:pt-0">
      <span className="text-[12px] font-semibold text-[#8B95A1]">{label}</span>
      <span className="text-right text-[14px] font-semibold text-[#191F28]">{value}</span>
    </div>
  )
}
