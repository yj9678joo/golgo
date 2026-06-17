import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  confirmScreenshotHoldings,
  createScreenshotAccount,
  fetchBrokerAccounts,
  fetchScreenshotJob,
  updateScreenshotHoldings,
  uploadPortfolioScreenshot,
} from '@/features/portfolio/api/screenshot-api'
import type { Holding } from '@/features/portfolio/types'

export function useScreenshotAccounts() {
  return useQuery({
    queryKey: ['broker-accounts'],
    queryFn: fetchBrokerAccounts,
  })
}

export function useCreateScreenshotAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createScreenshotAccount,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['broker-accounts'] })
    },
  })
}

export function useUploadPortfolioScreenshot() {
  return useMutation({
    mutationFn: ({ accountId, image }: { accountId: string; image: File }) =>
      uploadPortfolioScreenshot(accountId, image),
  })
}

export function useScreenshotJob(jobId: string | undefined) {
  return useQuery({
    queryKey: ['portfolio-screenshot', jobId],
    queryFn: () => fetchScreenshotJob(jobId ?? ''),
    enabled: Boolean(jobId),
  })
}

export function useUpdateScreenshotHoldings(jobId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (holdings: Holding[]) => updateScreenshotHoldings(jobId, holdings),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['portfolio-screenshot', jobId] })
    },
  })
}

export function useConfirmScreenshotHoldings(jobId: string) {
  return useMutation({
    mutationFn: (holdings: Holding[]) => confirmScreenshotHoldings(jobId, holdings),
  })
}
