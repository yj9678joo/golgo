import { useQuery } from '@tanstack/react-query'
import {
  fetchAnalysisStatus,
  getAnalysisStatusRefetchInterval,
} from '@/features/analysis/api/analysis-api'

export function useAnalysisStatus(reportId: string | null) {
  return useQuery({
    queryKey: ['analysis-status', reportId],
    queryFn: () => fetchAnalysisStatus(reportId ?? ''),
    enabled: Boolean(reportId),
    refetchInterval: (query) => getAnalysisStatusRefetchInterval(query.state.data),
  })
}
