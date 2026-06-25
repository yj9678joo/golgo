import type {
  Holding,
  ScreenshotJob,
  ScreenshotStatus,
} from '@/features/portfolio/types'

type ParsedHoldingResponse = {
  ticker: string
  name: string
  market: string
  quantity: number
  avgPrice: number
  currentPrice: number
  currency: string
  currentValueKrw: number
  manuallyEdited: boolean
}

export type ScreenshotJobResponse = {
  jobId: string
  status: ScreenshotStatus
  brokerCode: string
  accountNickname: string
  parsedAt: string | null
  confirmedAt: string | null
  confidence: number | null
  holdings: ParsedHoldingResponse[]
  totalAssetKrw: number
  warnings: string[]
  errorReason: string | null
  message: string
  estimatedSeconds: number
}

export function mapScreenshotJobResponse(response: ScreenshotJobResponse): ScreenshotJob {
  return {
    jobId: response.jobId,
    status: response.status,
    brokerName: response.brokerCode,
    accountNickname: response.accountNickname,
    parsedAt: response.parsedAt,
    confirmedAt: response.confirmedAt,
    confidence: response.confidence,
    holdings: response.holdings.map((holding) => ({
      symbol: holding.ticker,
      name: holding.name,
      market: holding.market,
      quantity: holding.quantity,
      averagePrice: holding.avgPrice,
      currentPrice: holding.currentPrice,
      currency: holding.currency,
      currentValueKrw: holding.currentValueKrw,
      manuallyEdited: holding.manuallyEdited,
    })),
    totalAssetKrw: response.totalAssetKrw,
    warnings: response.warnings,
    errorReason: response.errorReason,
    message: response.message,
    estimatedSeconds: response.estimatedSeconds,
  }
}

export function toHoldingPayload(holding: Holding) {
  return {
    ticker: holding.symbol,
    name: holding.name,
    market: holding.market,
    quantity: holding.quantity,
    avgPrice: holding.averagePrice,
    currentPrice: holding.currentPrice,
    currency: holding.currency,
    currentValueKrw: holding.currentValueKrw,
  }
}

export function toHoldingConfirmRequest(holdings: Holding[]) {
  return {
    confirmedHoldings: holdings.map(toHoldingPayload),
  }
}
