import { useQuery } from '@tanstack/react-query'
import {
  fetchPortfolioHistory,
  fetchPortfolio,
  fetchPortfolioSyncStatuses,
} from '@/features/portfolio/api/portfolio-api'
import type { PortfolioHistoryPeriod } from '@/features/portfolio/types'

export function usePortfolio() {
  return useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  })
}

export function usePortfolioSyncStatuses() {
  return useQuery({
    queryKey: ['portfolio-sync-statuses'],
    queryFn: fetchPortfolioSyncStatuses,
  })
}

export function usePortfolioHistory(period: PortfolioHistoryPeriod) {
  return useQuery({
    queryKey: ['portfolio-history', period],
    queryFn: () => fetchPortfolioHistory(period),
  })
}
