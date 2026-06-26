import type { PortfolioHolding } from '@/features/portfolio/types'
import { getTargetWeight } from '@/features/portfolio/utils/portfolio-display'

type WeightComparisonBarProps = {
  holding: PortfolioHolding
  index: number
  count: number
}

export function WeightComparisonBar({ holding, index, count }: WeightComparisonBarProps) {
  const targetWeight = getTargetWeight(holding, index, count)
  const deviation = holding.weight - targetWeight
  const currentWidth = Math.min(Math.max(holding.weight, 0), 100)
  const targetWidth = Math.min(Math.max(targetWeight, 0), 100)
  const isLargeDeviation = Math.abs(deviation) >= 5

  return (
    <article className="rounded-[16px] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[14px] font-semibold text-[#191F28]">{holding.name}</h3>
          <p className="mt-1 text-[12px] text-[#6B7684]">
            현재 {holding.weight.toFixed(1)}% · 목표 {targetWeight.toFixed(1)}%
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            isLargeDeviation ? 'bg-[#FFF4E5] text-[#B95E00]' : 'bg-[#E9FBF6] text-[#03ba8c]'
          }`}
        >
          {deviation > 0 ? '+' : ''}
          {deviation.toFixed(1)}%
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E8EB]">
            <div className="h-full rounded-full bg-[#03ba8c]" style={{ width: `${currentWidth}%` }} />
          </div>
        </div>
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-[#E5E8EB]">
            <div className="h-full rounded-full bg-[#8B95A1]" style={{ width: `${targetWidth}%` }} />
          </div>
        </div>
      </div>
    </article>
  )
}
