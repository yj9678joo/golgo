import { api, type ApiResponse } from '@/lib/api/client'
import type {
  PortfolioAccountSyncStatus,
  PortfolioDashboard,
  PortfolioHistoryPeriod,
  PortfolioHistoryResponse,
} from '@/features/portfolio/types'

export async function fetchPortfolio() {
  const response = await api.get<ApiResponse<PortfolioDashboard>>('/portfolio')
  return response.data.data
}

export async function fetchPortfolioSyncStatuses() {
  const response = await api.get<ApiResponse<PortfolioAccountSyncStatus[]>>(
    '/portfolio/accounts/sync-status',
  )
  return response.data.data
}

export async function fetchPortfolioHistory(period: PortfolioHistoryPeriod) {
  const response = await api.get<ApiResponse<PortfolioHistoryResponse>>('/portfolio/history', {
    params: { period },
  })
  return response.data.data
}
