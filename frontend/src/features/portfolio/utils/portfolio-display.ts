import type { PortfolioHolding } from '@/features/portfolio/types'

export function formatKrw(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

export function formatSignedPercent(value: number) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function getTargetWeight(holding: PortfolioHolding, index: number, count: number) {
  const preferredTargets: Record<string, number> = {
    '005930': 30,
    AAPL: 25,
    NVDA: 25,
    QQQ: 20,
  }

  if (holding.ticker && preferredTargets[holding.ticker] !== undefined) {
    return preferredTargets[holding.ticker]
  }

  if (count <= 0) {
    return 0
  }

  const base = Math.floor((100 / count) * 10) / 10
  if (index === count - 1) {
    return Number((100 - base * (count - 1)).toFixed(1))
  }
  return base
}

export function getPortfolioHasOutdatedAccount(syncStatus: string) {
  return syncStatus === 'OUTDATED' || syncStatus === 'ERROR'
}
