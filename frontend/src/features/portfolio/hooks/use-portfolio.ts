import { useQuery } from '@tanstack/react-query'
import {
  fetchPortfolio,
  fetchPortfolioSyncStatuses,
} from '@/features/portfolio/api/portfolio-api'

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
