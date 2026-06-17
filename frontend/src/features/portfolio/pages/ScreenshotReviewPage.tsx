import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Pencil, RefreshCw } from 'lucide-react'
import { MobilePage } from '@/components/layout/MobilePage'
import { HoldingEditSheet } from '@/features/portfolio/components/HoldingEditSheet'
import {
  useConfirmScreenshotHoldings,
  useScreenshotJob,
  useUpdateScreenshotHoldings,
} from '@/features/portfolio/hooks/use-screenshot-upload'
import type { Holding } from '@/features/portfolio/types'

export function ScreenshotReviewPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const jobQuery = useScreenshotJob(jobId)
  const updateHoldings = useUpdateScreenshotHoldings(jobId ?? '')
  const confirmHoldings = useConfirmScreenshotHoldings(jobId ?? '')
  const [editing, setEditing] = useState<Holding | null>(null)
  const [draftHoldings, setDraftHoldings] = useState<Holding[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const holdings = useMemo(
    () => draftHoldings ?? jobQuery.data?.holdings ?? [],
    [draftHoldings, jobQuery.data?.holdings],
  )
  const totalValue = useMemo(
    () => holdings.reduce((sum, holding) => sum + holding.currentValueKrw, 0),
    [holdings],
  )

  const saveHolding = (next: Holding) => {
    setDraftHoldings(
      holdings.map((holding) => (holding.symbol === editing?.symbol ? next : holding)),
    )
    setEditing(null)
  }

  const saveDraft = async () => {
    setError(null)

    try {
      await updateHoldings.mutateAsync(holdings)
      setDraftHoldings(null)
    } catch {
      setError('수정한 보유 종목을 저장하지 못했어요.')
    }
  }

  const confirm = async () => {
    setError(null)

    try {
      await confirmHoldings.mutateAsync(holdings)
      navigate('/', { replace: true })
    } catch {
      setError('보유 종목 확정에 실패했어요.')
    }
  }

  if (jobQuery.isLoading) {
    return <ReviewShell onBack={() => navigate(-1)}>분석 결과를 불러오는 중...</ReviewShell>
  }

  if (jobQuery.isError || !jobQuery.data) {
    return <ReviewShell onBack={() => navigate(-1)}>분석 결과를 확인할 수 없어요.</ReviewShell>
  }

  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4">
        <button
          className="mb-5 flex size-11 items-center justify-center rounded-[12px] bg-white text-[#4E5968]"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>

        <header>
          <p className="text-[13px] font-semibold text-[#03ba8c]">{jobQuery.data.brokerName}</p>
          <h1 className="mt-2 text-[27px] font-semibold leading-[1.25] text-[#191F28]">
            분석된 보유 종목을
            <br />
            확인해주세요
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[#6B7684]">
            임시 파서 결과라 실제 수치와 다를 수 있어요.
          </p>
        </header>

        <section className="mt-6 rounded-[18px] bg-white p-4">
          <p className="text-[12px] font-semibold text-[#8B95A1]">평가 금액</p>
          <p className="mt-2 text-[24px] font-semibold text-[#191F28]">
            {totalValue.toLocaleString('ko-KR')}원
          </p>
          <p className="mt-1 text-[12px] text-[#6B7684]">총 {holdings.length}개 종목</p>
        </section>

        <div className="mt-4 grid gap-2.5">
          {holdings.map((holding) => (
            <button
              key={holding.symbol}
              className="flex w-full items-center justify-between gap-3 rounded-[16px] bg-white p-4 text-left"
              type="button"
              onClick={() => setEditing(holding)}
            >
              <span className="min-w-0">
                <span className="block text-[15px] font-semibold text-[#191F28]">
                  {holding.name}
                </span>
                <span className="mt-1 block text-[12px] text-[#6B7684]">
                  {holding.quantity.toLocaleString('ko-KR')}주 · 평균{' '}
                  {holding.averagePrice.toLocaleString('ko-KR')}원
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block text-[13px] font-semibold text-[#191F28]">
                  {holding.currentValueKrw.toLocaleString('ko-KR')}원
                </span>
                <Pencil className="ml-auto mt-1 size-4 text-[#8B95A1]" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>

        {error ? (
          <p className="mt-4 rounded-[14px] bg-white p-3 text-center text-[13px] font-semibold text-[#E5484D]">
            {error}
          </p>
        ) : null}

        <div className="flex-1" />

        <div className="mt-6 grid gap-2">
          {draftHoldings ? (
            <button
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-[#191F28] px-4 text-[14px] font-semibold text-white"
              type="button"
              onClick={() => void saveDraft()}
              disabled={updateHoldings.isPending}
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              수정사항 저장
            </button>
          ) : null}
          <button
            className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-[#03ba8c] px-4 text-[15px] font-semibold text-white disabled:bg-[#B0B8C1]"
            type="button"
            onClick={() => void confirm()}
            disabled={confirmHoldings.isPending}
          >
            <Check className="size-4" aria-hidden="true" />
            {confirmHoldings.isPending ? '저장 중...' : '보유 종목 확정'}
          </button>
        </div>
      </div>

      <HoldingEditSheet
        holding={editing}
        onClose={() => setEditing(null)}
        onSave={saveHolding}
      />
    </MobilePage>
  )
}

function ReviewShell({
  children,
  onBack,
}: {
  children: string
  onBack: () => void
}) {
  return (
    <MobilePage
      className="bg-[#F2F4F6] text-[#191F28]"
      contentClassName="flex max-w-[430px]"
    >
      <div className="flex min-h-[calc(100svh-2rem)] w-full flex-col px-2 py-4">
        <button
          className="mb-5 flex size-11 items-center justify-center rounded-[12px] bg-white text-[#4E5968]"
          type="button"
          onClick={onBack}
          aria-label="뒤로가기"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
        </button>
        <div className="flex flex-1 items-center justify-center rounded-[18px] bg-white p-5 text-center text-[14px] font-semibold text-[#4E5968]">
          {children}
        </div>
      </div>
    </MobilePage>
  )
}
