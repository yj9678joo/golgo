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
