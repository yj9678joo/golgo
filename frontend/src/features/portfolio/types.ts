export type BrokerConnectionType = 'SCREENSHOT' | 'API_KEY'

export type ScreenshotStatus = 'UPLOADED' | 'PARSED' | 'CONFIRMED' | 'FAILED'

export type BrokerAccount = {
  id: string
  brokerName: string
  displayName: string
  connectionType: BrokerConnectionType
  connectedAt: string
}

export type Holding = {
  symbol: string
  name: string
  quantity: number
  averagePrice: number
  currentPrice: number
  currentValueKrw: number
}

export type ScreenshotUploadResult = {
  jobId: string
  accountId: string
  status: ScreenshotStatus
  holdings: Holding[]
}

export type ScreenshotJob = {
  jobId: string
  accountId: string
  brokerName: string
  status: ScreenshotStatus
  holdings: Holding[]
}

export type ScreenshotConfirmResult = {
  screenshotId: string
  accountId: string
  savedHoldingCount: number
}
