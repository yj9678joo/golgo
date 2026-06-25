import type {
  PortfolioHistoryResponse,
  PortfolioHolding,
} from '@/features/portfolio/types'

export function formatKrw(value: number) {
  return `${Math.round(value).toLocaleString('ko-KR')}원`
}

export function formatCompactKrw(value: number) {
  const rounded = Math.round(value)
  const sign = rounded < 0 ? '-' : ''
  const abs = Math.abs(rounded)

  if (abs >= 10000) {
    return `${sign}${Math.round(abs / 10000).toLocaleString('ko-KR')}만`
  }

  return `${sign}${abs.toLocaleString('ko-KR')}`
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

export function getSparklineLimit(period: string) {
  const limits: Record<string, number> = {
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    ALL: 365,
  }

  return limits[period] ?? limits['3M']
}

export function buildPortfolioHistorySeries(history?: PortfolioHistoryResponse) {
  if (!history) {
    return []
  }

  return history.snapshots
    .filter((snapshot) => Number.isFinite(snapshot.totalAssetKrw))
    .map((snapshot) => ({
      date: snapshot.date,
      value: snapshot.totalAssetKrw,
    }))
}

export function getTickerBadgeLabel(ticker: string | null, name: string) {
  const source = ticker?.trim() || name.trim()
  return source.slice(0, 4).toUpperCase()
}

export function estimateHoldingProfitKrw(currentValueKrw: number, profitRate: number) {
  if (profitRate <= -100) {
    return 0
  }

  const costBasis = currentValueKrw / (1 + profitRate / 100)
  return Math.round(currentValueKrw - costBasis)
}
