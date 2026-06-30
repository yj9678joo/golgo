import { Activity } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { SkeletonBlock } from '@/components/common/SkeletonBlock'
import { ANALYSIS_STATUS_LABELS } from '@/features/analysis/api/analysis-api'
import type { AnalysisReportStatusResponse } from '@/features/analysis/types'

type AnalysisProgressCardProps = {
  status: AnalysisReportStatusResponse | undefined
  isLoading: boolean
}

export function AnalysisProgressCard({ status, isLoading }: AnalysisProgressCardProps) {
  if (isLoading) {
    return <SkeletonBlock className="h-[128px]" />
  }

  if (!status) {
    return null
  }

  return (
    <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-[#E9FBF6] text-[#03ba8c]">
          <Activity className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-[#8B95A1]">
            {ANALYSIS_STATUS_LABELS[status.status]}
          </p>
          <h2 className="mt-1 truncate text-[17px] font-semibold text-[#191F28]">
            {status.currentStep ?? '분석 준비 중'}
          </h2>
        </div>
        <span className="font-mono text-[15px] font-bold text-[#191F28]">
          {status.progressPct}%
        </span>
      </div>
      <Progress className="mt-4 h-2 bg-[#F2F4F6] [&>div]:bg-[#03ba8c]" value={status.progressPct} />
    </Card>
  )
}
