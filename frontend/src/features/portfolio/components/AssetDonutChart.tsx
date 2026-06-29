import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/card'
import type { PortfolioHolding } from '@/features/portfolio/types'

const COLORS = ['#03ba8c', '#3182F6', '#FFB020', '#E5484D', '#8B95A1', '#7C3AED']

type AssetDonutChartProps = {
  holdings: PortfolioHolding[]
}

export function AssetDonutChart({ holdings }: AssetDonutChartProps) {
  const data = holdings
    .filter((holding) => holding.currentValueKrw > 0)
    .map((holding) => ({
      name: holding.name,
      value: holding.currentValueKrw,
    }))

  if (data.length === 0) {
    return (
      <Card className="flex h-[210px] items-center justify-center rounded-[18px] border-0 bg-white text-[13px] font-semibold text-[#8B95A1] shadow-none">
        표시할 보유 종목이 없어요
      </Card>
    )
  }

  return (
    <Card className="rounded-[18px] border-0 bg-white p-4 shadow-none">
      <div className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 grid gap-2">
        {holdings.slice(0, 6).map((holding, index) => (
          <div key={`${holding.ticker ?? holding.name}-${index}`} className="flex items-center gap-2">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-[12px] text-[#4E5968]">
              {holding.name}
            </span>
            <span className="text-[12px] font-semibold text-[#191F28]">
              {holding.weight.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
