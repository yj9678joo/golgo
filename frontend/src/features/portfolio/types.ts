export type BrokerConnectionType = 'SCREENSHOT' | 'API_KEY'

export type ScreenshotStatus = 'UPLOADED' | 'PARSED' | 'CONFIRMED' | 'FAILED'

export type BrokerAccount = {
  accountId: string
  brokerCode: string
  connectionType: BrokerConnectionType
  accountNickname: string
  connectedAt: string
  lastSyncedAt: string | null
  notice: string
}

export type Holding = {
  symbol: string
  name: string
  market: string
  quantity: number
  averagePrice: number
  currentPrice: number
  currency: string
  currentValueKrw: number
  manuallyEdited: boolean
}

export type ScreenshotUploadResult = {
  jobId: string
  status: ScreenshotStatus
  estimatedSeconds: number
}

export type ScreenshotJob = {
  jobId: string
  status: ScreenshotStatus
  brokerName: string
  accountNickname: string
  parsedAt: string | null
  confirmedAt: string | null
  confidence: number | null
  holdings: Holding[]
  totalAssetKrw: number
  warnings: string[]
  errorReason: string | null
  message: string
  estimatedSeconds: number
}

export type ScreenshotConfirmResult = {
  jobId: string
  status: ScreenshotStatus
  savedHoldingsCount: number
  savedAt: string
}

export type PortfolioSyncStatus = 'SYNCED' | 'OUTDATED' | 'ERROR'

export type PortfolioAccount = {
  accountId: string
  brokerCode: string
  accountNickname: string
  connectionType: BrokerConnectionType
  lastSyncedAt: string | null
  syncStatus: PortfolioSyncStatus
  daysSinceSync: number | null
}

export type PortfolioHolding = {
  ticker: string | null
  name: string
  market: string
  quantity: number
  avgPrice: number
  currentPrice: number | null
  currentValueKrw: number
  weight: number
  profitRate: number
  accountId: string
}

export type PortfolioDashboard = {
  totalAssetKrw: number
  totalProfitKrw: number
  profitRate: number
  accounts: PortfolioAccount[]
  holdings: PortfolioHolding[]
  updatedAt: string
}

export type PortfolioAccountSyncStatus = {
  accountId: string
  brokerCode: string
  connectionType: BrokerConnectionType
  syncStatus: PortfolioSyncStatus
  lastSyncedAt: string | null
  daysSinceSync: number | null
  nudgeMessage: string | null
}

export type PortfolioHistoryPeriod = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

export type PortfolioHistorySnapshot = {
  date: string
  totalAssetKrw: number
}

export type PortfolioHistoryResponse = {
  period: string
  snapshots: PortfolioHistorySnapshot[]
}
