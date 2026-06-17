import { api, type ApiResponse } from '@/lib/api/client'
import type {
  BrokerAccount,
  Holding,
  ScreenshotConfirmResult,
  ScreenshotJob,
  ScreenshotUploadResult,
} from '@/features/portfolio/types'

export async function createScreenshotAccount() {
  const response = await api.post<ApiResponse<BrokerAccount>>('/brokers/connect/screenshot', {
    brokerName: 'MTS 캡처',
    displayName: 'MTS 캡처 계좌',
  })

  return response.data.data
}

export async function fetchBrokerAccounts() {
  const response = await api.get<ApiResponse<BrokerAccount[]>>('/brokers/accounts')
  return response.data.data
}

export async function uploadPortfolioScreenshot(accountId: string, image: File) {
  const formData = new FormData()
  formData.append('accountId', accountId)
  formData.append('image', image)

  const response = await api.post<ApiResponse<ScreenshotUploadResult>>(
    '/portfolio/screenshot',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )

  return response.data.data
}

export async function fetchScreenshotJob(jobId: string) {
  const response = await api.get<ApiResponse<ScreenshotJob>>(`/portfolio/screenshot/${jobId}`)
  return response.data.data
}

export async function updateScreenshotHoldings(jobId: string, holdings: Holding[]) {
  const response = await api.patch<ApiResponse<ScreenshotJob>>(
    `/portfolio/screenshot/${jobId}/holdings`,
    {
      holdings,
    },
  )

  return response.data.data
}

export async function confirmScreenshotHoldings(jobId: string, holdings: Holding[]) {
  const response = await api.post<ApiResponse<ScreenshotConfirmResult>>(
    `/portfolio/screenshot/${jobId}/confirm`,
    {
      holdings,
    },
  )

  return response.data.data
}
