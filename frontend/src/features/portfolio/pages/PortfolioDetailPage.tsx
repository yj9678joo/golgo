import { RefreshCw, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { AppTabLayout } from '@/components/layout/AppTabLayout'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { SkeletonBlock } from '@/components/common/SkeletonBlock'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { usePortfolio } from '@/features/portfolio/hooks/use-portfolio'
import type { PortfolioHolding } from '@/features/portfolio/types'
import {
  estimateHoldingProfitKrw,
  formatCompactKrw,
  formatKrw,
  formatSignedPercent,
  getKoreanProfitTone,
  getTargetWeight,
} from '@/features/portfolio/utils/portfolio-display'
import { getPortfolioRefreshNotice } from '@/features/portfolio/utils/portfolio-detail-display'

const COLORS = ['#03ba8c', '#3182F6', '#FFB020', '#E5484D', '#7C3AED', '#8B95A1']

type DonutView = 'current' | 'target'

export function PortfolioDetailPage() {
  const navigate = useNavigate()
  const [donutView, setDonutView] = useState<DonutView>('current')
  const portfolioQuery = usePortfolio()
  const portfolio = portfolioQuery.data
  const refreshNotice = getPortfolioRefreshNotice(portfolio?.accounts ?? [])
  const sortedHoldings = useMemo(
    () => [...(portfolio?.holdings ?? [])].sort((a, b) => b.weight - a.weight),
    [portfolio?.holdings],
  )

  return (
    <AppTabLayout>
      <header>
        <p className="text-[13px] font-semibold text-[#8B95A1]">Portfolio</p>
        <h1 className="mt-1 text-[22px] font-semibold leading-[1.3] text-[#191F28]">
          자산 비중
        </h1>
      </header>

      <div className="mt-5 grid gap-3">
        {portfolioQuery.isLoading ? (
          <>
            <SkeletonBlock className="h-[76px]" />
            <SkeletonBlock className="h-[268px]" />
            <SkeletonBlock className="h-[260px]" />
          </>
        ) : null}

        {portfolioQuery.isError ? (
          <ErrorState
            message="포트폴리오 상세를 불러오지 못했어요."
            onRetry={() => void portfolioQuery.refetch()}
          />
        ) : null}

        {portfolio && portfolio.holdings.length === 0 ? (
          <EmptyState
            title="비교할 보유 종목이 없어요"
            description="캡처 업로드 후 종목을 확정하면 자산 비중 차트를 볼 수 있어요."
          />
        ) : null}

        {portfolio && portfolio.holdings.length > 0 ? (
          <>
            {refreshNotice ? (
              <Card className="flex items-center gap-3 rounded-[16px] border-0 bg-[#FFF4E5] px-4 py-3 text-[#8A4B00] shadow-none">
                <RefreshCw className="size-4 shrink-0" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{refreshNotice.title}</p>
                  <p className="truncate text-[12px] text-[#8A4B00]/75">{refreshNotice.description}</p>
                </div>
                <Button
                  className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-[10px] bg-[#03ba8c] px-3 text-[12px] font-semibold text-white"
                  type="button"
                  onClick={() => navigate('/portfolio/screenshot')}
                >
                  <Upload className="size-3.5" aria-hidden="true" />
                  업로드
                </Button>
              </Card>
            ) : null}

            <Card className="rounded-[20px] border-0 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[16px] font-semibold text-[#191F28]">자산 비중</h2>
                  <p className="mt-1 truncate text-[12px] text-[#8B95A1]">
                    총 {portfolio.holdings.length}개 종목 · {formatKrw(portfolio.totalAssetKrw)}
                  </p>
                </div>
                <SegmentToggle value={donutView} onChange={setDonutView} />
              </div>

              <div className="mt-4 grid grid-cols-[132px_1fr] items-center gap-4">
                <div className="h-[132px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getDonutData(sortedHoldings, donutView)}
                        dataKey="value"
                        innerRadius={48}
                        outerRadius={66}
                        paddingAngle={2}
                        stroke="none"
                      >
                        {sortedHoldings.map((holding, index) => (
                          <Cell
                            key={`${holding.accountId}-${holding.ticker ?? holding.name}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid min-w-0 gap-2">
                  {sortedHoldings.slice(0, 6).map((holding, index) => (
                    <LegendRow
                      key={`${holding.accountId}-${holding.ticker ?? holding.name}`}
                      color={COLORS[index % COLORS.length]}
                      holding={holding}
                      index={index}
                      count={sortedHoldings.length}
                      view={donutView}
                    />
                  ))}
                </div>
              </div>
            </Card>

            <Card className="rounded-[20px] border-0 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[16px] font-semibold text-[#191F28]">현재 vs 목표</h2>
                <div className="flex shrink-0 items-center gap-3">
                  <BarLegend color="#191F28" label="현재" />
                  <BarLegend color="#B0B8C1" label="목표" />
                </div>
              </div>
              <div className="divide-y divide-[#F2F4F6]">
                {sortedHoldings.map((holding, index) => (
                  <WeightRow
                    key={`${holding.accountId}-${holding.ticker ?? holding.name}`}
                    color={COLORS[index % COLORS.length]}
                    holding={holding}
                    index={index}
                    count={sortedHoldings.length}
                  />
                ))}
              </div>
            </Card>

            <Card className="rounded-[20px] border-0 bg-white px-4 pb-2 pt-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
              <h2 className="text-[16px] font-semibold text-[#191F28]">종목별 수익률</h2>
              <div className="mt-2 divide-y divide-[#F2F4F6]">
                {sortedHoldings.map((holding) => (
                  <ProfitRow
                    key={`${holding.accountId}-${holding.ticker ?? holding.name}`}
                    holding={holding}
                  />
                ))}
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </AppTabLayout>
  )
}

function getDonutData(holdings: PortfolioHolding[], view: DonutView) {
  const data = holdings.map((holding, index) => ({
    name: holding.name,
    value: view === 'current' ? holding.weight : getTargetWeight(holding, index, holdings.length),
  }))

  if (data.every((item) => item.value <= 0)) {
    return data.map((item) => ({ ...item, value: 1 }))
  }

  return data
}

function SegmentToggle({
  value,
  onChange,
}: {
  value: DonutView
  onChange: (value: DonutView) => void
}) {
  return (
    <div className="grid grid-cols-2 rounded-[10px] bg-[#F2F4F6] p-1">
      {(['current', 'target'] as const).map((item) => (
        <Button
          key={item}
          className={`h-7 rounded-[8px] px-3 text-[11px] font-semibold ${
            value === item ? 'bg-white text-[#191F28] shadow-sm' : 'text-[#8B95A1]'
          }`}
          type="button"
          variant="ghost"
          onClick={() => onChange(item)}
        >
          {item === 'current' ? '현재' : '목표'}
        </Button>
      ))}
    </div>
  )
}

function LegendRow({
  color,
  holding,
  index,
  count,
  view,
}: {
  color: string
  holding: PortfolioHolding
  index: number
  count: number
  view: DonutView
}) {
  const value = view === 'current' ? holding.weight : getTargetWeight(holding, index, count)

  return (
    <div className="min-w-0">
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-1.5 size-2.5 shrink-0 rounded-[3px]" style={{ backgroundColor: color }} />
        <span className="min-w-0 flex-1 break-keep text-[12px] font-semibold leading-[1.35] text-[#191F28]">
          {holding.name}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 pl-[18px]">
        <span className="truncate font-mono text-[11px] font-semibold text-[#8B95A1]">
          {holding.ticker ?? holding.market}
        </span>
        <span className="shrink-0 font-mono text-[12px] font-bold text-[#191F28]">
          {value.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

function BarLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8B95A1]">
      <span className="h-1 w-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  )
}

function WeightRow({
  color,
  holding,
  index,
  count,
}: {
  color: string
  holding: PortfolioHolding
  index: number
  count: number
}) {
  const targetWeight = getTargetWeight(holding, index, count)
  const deviation = holding.weight - targetWeight
  const max = Math.max(holding.weight, targetWeight, 1)

  return (
    <div className="py-3">
      <div className="flex min-w-0 items-start gap-2">
        <span className="mt-1.5 size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
        <span className="min-w-0 flex-1 break-keep text-[13px] font-semibold leading-[1.35] text-[#191F28]">
          {holding.name}
        </span>
      </div>
      <div className="mt-2 grid gap-1.5 pl-4">
        <div className="grid grid-cols-[44px_1fr_48px] items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8B95A1]">현재</span>
          <div className="h-2 overflow-hidden rounded-full bg-[#F2F4F6]">
            <div
              className="h-full rounded-full"
              style={{ width: `${(holding.weight / max) * 100}%`, backgroundColor: color }}
            />
          </div>
          <span className="justify-self-end font-mono text-[11px] font-bold text-[#191F28]">
            {holding.weight.toFixed(1)}%
          </span>
        </div>
        <div className="grid grid-cols-[44px_1fr_48px] items-center gap-2">
          <span className="text-[11px] font-semibold text-[#8B95A1]">목표</span>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#F2F4F6]">
            <div
              className="h-full rounded-full bg-[#B0B8C1]"
              style={{ width: `${(targetWeight / max) * 100}%` }}
            />
          </div>
          <span className="justify-self-end font-mono text-[11px] font-bold text-[#4E5968]">
            {targetWeight.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="mt-2 flex justify-end">
        <span
          className={`rounded-full px-2 py-1 font-mono text-[10px] font-bold ${
          Math.abs(deviation) >= 5 ? 'bg-[#FFF4E5] text-[#B95E00]' : 'bg-[#F2F4F6] text-[#4E5968]'
          }`}
        >
          {deviation > 0 ? '+' : ''}
          {deviation.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

function ProfitRow({ holding }: { holding: PortfolioHolding }) {
  const profitColorClass = getProfitColorClass(getKoreanProfitTone(holding.profitRate))
  const profitKrw = estimateHoldingProfitKrw(holding.currentValueKrw, holding.profitRate)

  return (
    <div className="flex min-w-0 items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <p className="break-keep text-[14px] font-semibold leading-[1.35] text-[#191F28]">{holding.name}</p>
        <p className="mt-1 truncate text-[12px] text-[#8B95A1]">
          {holding.quantity.toLocaleString('ko-KR')}주 · 평단 {formatCompactKrw(holding.avgPrice)}
          원
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[13px] font-bold text-[#191F28]">
          {formatCompactKrw(holding.currentValueKrw)}원
        </p>
        <p className={`mt-1 font-mono text-[11px] font-bold ${profitColorClass}`}>
          {formatCompactKrw(profitKrw)}원 ({formatSignedPercent(holding.profitRate)})
        </p>
      </div>
    </div>
  )
}

function getProfitColorClass(tone: ReturnType<typeof getKoreanProfitTone>) {
  if (tone === 'profit') {
    return 'text-[#D92D3A]'
  }

  if (tone === 'loss') {
    return 'text-[#1E64D8]'
  }

  return 'text-[#4E5968]'
}
