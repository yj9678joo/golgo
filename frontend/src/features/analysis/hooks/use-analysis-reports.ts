import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAnalysisReport,
  fetchAnalysisReports,
} from '@/features/analysis/api/analysis-api'
import type { AnalysisReportCreateRequest } from '@/features/analysis/types'

export function useAnalysisReports() {
  return useQuery({
    queryKey: ['analysis-reports'],
    queryFn: fetchAnalysisReports,
  })
}

export function useCreateAnalysisReport() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: AnalysisReportCreateRequest) => createAnalysisReport(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['analysis-reports'] })
    },
  })
}
