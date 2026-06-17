import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Shield } from 'lucide-react'
import { MobilePage } from '@/components/layout/MobilePage'
import { OnboardingStepBar } from '@/features/onboarding/components/OnboardingStepBar'
import { SelectableOption } from '@/features/onboarding/components/SelectableOption'
import {
  brokerOptions,
  personaOptions,
} from '@/features/onboarding/data/onboarding-options'
import type {
  BrokerId,
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
  const [step, setStep] = useState<OnboardingStep>('persona')
  const [persona, setPersona] = useState<InvestmentPersona>('balanced')
  const [brokerId, setBrokerId] = useState<BrokerId>('kis')

  const selectedBroker = brokerOptions.find((broker) => broker.id === brokerId) ?? brokerOptions[0]

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
            <button
              className="inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white transition hover:bg-[#02a77e]"
              type="button"
              onClick={() => setStep('broker')}
            >
              다음
            </button>
            <button
              className="h-11 text-[14px] font-semibold text-[#8B95A1]"
              type="button"
              onClick={() => {
                setPersona('balanced')
                setStep('broker')
              }}
            >
              나중에 설정할게요
            </button>
          </div>
        </OnboardingFrame>
      ) : null}

      {step === 'broker' ? (
        <OnboardingFrame>
          <OnboardingStepBar current={3} total={3} />
          <OnboardingHeading
            title={
              <>
                증권사 계좌를
                <br />
                연결해주세요
              </>
            }
            description="보유 종목을 자동으로 불러와요"
          />
          <div className="grid gap-2.5">
            {brokerOptions.map((broker) => (
              <SelectableOption
                key={broker.id}
                title={broker.name}
                description={broker.methods.join(' · ')}
                badge={broker.brandLabel}
                selected={brokerId === broker.id}
                onClick={() => setBrokerId(broker.id)}
              />
            ))}
          </div>
          <div className="mt-4 flex gap-2 rounded-[16px] bg-white p-3.5">
            <Shield className="mt-0.5 size-4 shrink-0 text-[#03ba8c]" aria-hidden="true" />
            <p className="text-[12px] leading-5 text-[#4E5968]">
              API Key는 암호화 저장을 전제로 설계합니다.
            </p>
          </div>
          <div className="mt-auto grid gap-2 pt-5 sm:mt-7">
            <button
              className="inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white transition hover:bg-[#02a77e]"
              type="button"
              onClick={() => setStep('done')}
            >
              고르고 시작하기
            </button>
            <button
              className="h-11 text-[14px] font-semibold text-[#8B95A1]"
              type="button"
              onClick={() => setStep('done')}
            >
              나중에 연결할게요
            </button>
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
            <div className="mt-6 w-full rounded-[18px] bg-white p-4 text-left">
              <SummaryRow label="투자 성향" value={personaLabels[persona]} />
              <SummaryRow label="연결 증권사" value={selectedBroker.name} />
            </div>
          </div>
          <button
            className="inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white transition hover:bg-[#02a77e]"
            type="button"
            onClick={() => navigate('/', { replace: true })}
          >
            대시보드 보러가기
          </button>
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
