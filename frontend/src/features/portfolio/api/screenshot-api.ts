import { api, type ApiResponse } from '@/lib/api/client'
import type {
  BrokerAccount,
  Holding,
  ScreenshotConfirmResult,
  ScreenshotUploadResult,
} from '@/features/portfolio/types'
import { createScreenshotAccountPayload } from '@/features/portfolio/api/screenshot-account-contract'
import {
  mapScreenshotJobResponse,
  toHoldingPayload,
  type ScreenshotJobResponse,
} from '@/features/portfolio/api/screenshot-job-contract'

export async function createScreenshotAccount() {
  const response = await api.post<ApiResponse<BrokerAccount>>(
    '/brokers/connect/screenshot',
    createScreenshotAccountPayload(),
  )

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
  const response = await api.get<ApiResponse<ScreenshotJobResponse>>(
    `/portfolio/screenshot/${jobId}`,
  )
  return mapScreenshotJobResponse(response.data.data)
}

export async function updateScreenshotHoldings(jobId: string, holdings: Holding[]) {
  const response = await api.patch<ApiResponse<ScreenshotJobResponse>>(
    `/portfolio/screenshot/${jobId}/holdings`,
    {
      holdings: holdings.map(toHoldingPayload),
    },
  )

  return mapScreenshotJobResponse(response.data.data)
}

export async function confirmScreenshotHoldings(jobId: string, holdings: Holding[]) {
  const response = await api.post<ApiResponse<ScreenshotConfirmResult>>(
    `/portfolio/screenshot/${jobId}/confirm`,
    {
      holdings: holdings.map(toHoldingPayload),
    },
  )

  return response.data.data
}
