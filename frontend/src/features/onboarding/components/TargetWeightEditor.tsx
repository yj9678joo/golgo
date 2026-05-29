import { Check, Minus, Plus, RotateCcw } from 'lucide-react'
import type { TargetWeight } from '../types'

type TargetWeightEditorProps = {
  weights: TargetWeight[]
  onChange: (ticker: string, weight: number) => void
  onReset: () => void
}

function clampWeight(value: number) {
  return Math.max(0, Math.min(100, value))
}

export function TargetWeightEditor({
  weights,
  onChange,
  onReset,
}: TargetWeightEditorProps) {
  const total = weights.reduce((sum, item) => sum + item.weight, 0)
  const diff = 100 - total
  const isExact = total === 100

  return (
    <div className="grid gap-3">
      <div className="rounded-[18px] border border-[#E5E8EB] bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[14px] font-semibold text-[#4E5968]">합계</span>
          <div className="flex items-center gap-2">
            <span className="text-[24px] font-bold leading-none text-[#191F28]">
              {total}
            </span>
            <span className="text-[13px] font-medium text-[#8B95A1]">/ 100%</span>
            <span
              className={
                isExact
                  ? 'inline-flex h-6 items-center gap-1 rounded-full bg-[#E8FFF5] px-2 text-[11px] font-semibold text-[#008F6C]'
                  : 'inline-flex h-6 items-center rounded-full bg-[#FFF4E6] px-2 text-[11px] font-semibold text-[#F97316]'
              }
            >
              {isExact ? (
                <>
                  <Check className="size-3" aria-hidden="true" />
                  완료
                </>
              ) : diff > 0 ? (
                `${diff}% 부족`
              ) : (
                `${Math.abs(diff)}% 초과`
              )}
            </span>
          </div>
        </div>

        <div className="flex h-2 overflow-hidden rounded-full bg-[#F2F4F6]">
          {weights.map((item) =>
            item.weight > 0 ? (
              <div
                key={item.ticker}
                className={item.colorClassName}
                style={{ width: `${item.weight}%` }}
              />
            ) : null,
          )}
        </div>

        <button
          className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full bg-[#F2F4F6] px-3 text-[12px] font-semibold text-[#4E5968]"
          type="button"
          onClick={onReset}
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          추천 비중으로 초기화
        </button>
      </div>

      <div className="grid gap-2">
        {weights.map((item) => (
          <div key={item.ticker} className="rounded-[18px] bg-white p-3.5">
            <div className="mb-3 flex items-center gap-3">
              <span
                className={`flex size-10 shrink-0 items-center justify-center rounded-[12px] text-[11px] font-bold text-white ${item.colorClassName}`}
              >
                {item.ticker.slice(0, 3)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[14px] font-semibold text-[#191F28]">
                  {item.name}
                </span>
                <span className="mt-0.5 block text-[12px] text-[#8B95A1]">
                  {item.sector}
                </span>
              </span>
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  className="flex size-8 items-center justify-center rounded-[10px] bg-[#F2F4F6] text-[#4E5968] disabled:opacity-35"
                  type="button"
                  disabled={item.weight <= 0}
                  onClick={() => onChange(item.ticker, clampWeight(item.weight - 5))}
                  aria-label={`${item.name} 비중 감소`}
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <span className="min-w-12 text-center text-[16px] font-bold text-[#191F28]">
                  {item.weight}
                  <span className="text-[11px] font-semibold text-[#8B95A1]">%</span>
                </span>
                <button
                  className="flex size-8 items-center justify-center rounded-[10px] bg-[#F2F4F6] text-[#4E5968] disabled:opacity-35"
                  type="button"
                  disabled={item.weight >= 100}
                  onClick={() => onChange(item.ticker, clampWeight(item.weight + 5))}
                  aria-label={`${item.name} 비중 증가`}
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <input
              className="h-7 w-full accent-[#191F28]"
              type="range"
              min={0}
              max={100}
              step={5}
              value={item.weight}
              onChange={(event) => onChange(item.ticker, Number(event.target.value))}
              aria-label={`${item.name} 목표 비중`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
