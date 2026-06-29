import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, ImageUp, KeyRound } from 'lucide-react'
import { MobilePage } from '@/components/layout/MobilePage'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SelectableOption } from '@/features/onboarding/components/SelectableOption'
import {
  brokerOptions,
  brokerSetupNotes,
} from '@/features/onboarding/data/onboarding-options'
import type {
  BrokerConnectionMethod,
  BrokerId,
} from '@/features/onboarding/types'

export function BrokerSetupPage() {
  const navigate = useNavigate()
  const [selectedBrokerId, setSelectedBrokerId] = useState<BrokerId>('kis')
  const [method, setMethod] = useState<BrokerConnectionMethod>('api-key')
  const [isDone, setIsDone] = useState(false)

  const selectedBroker =
    brokerOptions.find((broker) => broker.id === selectedBrokerId) ?? brokerOptions[0]
  const isKis = selectedBrokerId === 'kis'
  const effectiveMethod = isKis ? method : 'screenshot'

  if (isDone) {
    return (
      <MobilePage
        className="bg-[#F2F4F6] text-[#191F28]"
        contentClassName="flex max-w-[430px]"
      >
        <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4">
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <div className="mb-7 flex size-22 items-center justify-center rounded-[28px] bg-[#191F28] text-white">
              <Check className="size-10" aria-hidden="true" />
            </div>
            <h1 className="text-[27px] font-semibold leading-[1.25]">
              증권사 설정 준비가
              <br />
              완료됐어요
            </h1>
            <p className="mt-3 text-[14px] leading-6 text-[#6B7684]">
              다음 단계에서 실제 App Key 등록 또는 캡처 업로드 기능을 연결할 수 있어요.
            </p>
            <Card className="mt-7 w-full rounded-[18px] border-0 bg-white p-4 text-left shadow-none">
              <SummaryRow label="증권사" value={selectedBroker.name} />
              <SummaryRow
                label="연결 방식"
                value={effectiveMethod === 'api-key' ? 'App Key 연결' : 'MTS 캡처'}
              />
            </Card>
          </div>
          <Button
            className="inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#191F28] px-4 text-[15px] font-semibold text-white"
            type="button"
            onClick={() => navigate('/', { replace: true })}
          >
            홈으로 이동
          </Button>
        </div>
      </MobilePage>
    )
  }

  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4">
        <Button
          className="mb-5 flex size-11 items-center justify-center rounded-[12px] bg-white text-[#4E5968]"
          type="button"
          variant="ghost"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </Button>

        <header>
          <h1 className="text-[27px] font-semibold leading-[1.25] text-[#191F28]">
            증권사 설정
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[#6B7684]">
            보유 종목을 불러올 방식을 선택해주세요
          </p>
        </header>

        <div className="mt-6 grid gap-2.5">
          {brokerOptions.map((broker) => (
            <SelectableOption
              key={broker.id}
              title={broker.name}
              description={broker.methods.join(' · ')}
              badge={broker.brandLabel}
              selected={selectedBrokerId === broker.id}
              onClick={() => {
                setSelectedBrokerId(broker.id)
                if (broker.id !== 'kis') {
                  setMethod('screenshot')
                }
              }}
            />
          ))}
        </div>

        <section className="mt-5 grid gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-normal text-[#8B95A1]">
            연결 방식
          </p>
          {isKis ? (
            <div className="grid gap-2">
              <MethodButton
                icon={KeyRound}
                title="App Key 연결"
                description="자동 동기화 준비를 위한 추천 방식"
                selected={method === 'api-key'}
                onClick={() => setMethod('api-key')}
              />
              <MethodButton
                icon={ImageUp}
                title="MTS 캡처로 시작"
                description="보유 종목 화면을 캡처해 업로드"
                selected={method === 'screenshot'}
                onClick={() => setMethod('screenshot')}
              />
            </div>
          ) : (
            <MethodButton
              icon={ImageUp}
              title="MTS 캡처로 시작"
              description="기타 증권사는 캡처 방식으로 먼저 지원합니다"
              selected
              onClick={() => setMethod('screenshot')}
            />
          )}
        </section>

        <Card className="mt-5 grid gap-2 rounded-[18px] border-0 bg-white p-4 shadow-none">
          {brokerSetupNotes.map((note) => {
            const Icon = note.icon

            return (
              <div key={note.text} className="flex gap-2.5">
                <Icon className="mt-0.5 size-4 shrink-0 text-[#8B95A1]" aria-hidden="true" />
                <p className="text-[12px] leading-5 text-[#4E5968]">{note.text}</p>
              </div>
            )
          })}
        </Card>

        <div className="flex-1" />

        <Button
          className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-[16px] bg-[#191F28] px-4 text-[15px] font-semibold text-white"
          type="button"
          onClick={() => setIsDone(true)}
        >
          설정 준비 완료
        </Button>
      </div>
    </MobilePage>
  )
}

function MethodButton({
  icon: Icon,
  title,
  description,
  selected,
  onClick,
}: {
  icon: typeof KeyRound
  title: string
  description: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <Button
      className={
        selected
          ? 'flex w-full items-center gap-3 whitespace-normal rounded-[16px] border border-[#191F28] bg-white p-3.5 text-left shadow-sm'
          : 'flex w-full items-center gap-3 whitespace-normal rounded-[16px] border border-[#E5E8EB] bg-white p-3.5 text-left'
      }
      type="button"
      variant="outline"
      onClick={onClick}
    >
      <span
        className={
          selected
            ? 'flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#191F28] text-white'
            : 'flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-[#F2F4F6] text-[#4E5968]'
        }
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-[#191F28]">{title}</span>
        <span className="mt-1 block text-[12px] leading-5 text-[#6B7684]">
          {description}
        </span>
      </span>
    </Button>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#F2F4F6] py-3 last:border-b-0">
      <span className="text-[12px] font-semibold text-[#8B95A1]">{label}</span>
      <span className="text-right text-[14px] font-semibold text-[#191F28]">{value}</span>
    </div>
  )
}
