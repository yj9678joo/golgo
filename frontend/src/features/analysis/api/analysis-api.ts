import type { ApiResponse } from '../../../lib/api/client'
import type {
  AnalysisReportCreateRequest,
  AnalysisReportCreateResponse,
  AnalysisReportStatusResponse,
  AnalysisReportSummary,
  AnalysisStatus,
  AssetType,
  LlmProvider,
} from '@/features/analysis/types'

export const ANALYSIS_STATUS_LABELS: Record<AnalysisStatus, string> = {
  PENDING: '대기 중',
  PROCESSING: '분석 중',
  COMPLETED: '완료',
  FAILED: '실패',
}

type PollableStatus = {
  status: AnalysisStatus
}

async function getApi() {
  const { api } = await import('../../../lib/api/client')
  return api
}

export function createAnalysisReportPayload(
  ticker: string,
  assetType: AssetType,
  llmProvider: LlmProvider,
): AnalysisReportCreateRequest {
  return {
    ticker: ticker.trim().toUpperCase(),
    assetType,
    analysisType: 'DEEP_INFERENCE',
    llmProvider,
  }
}

export function getAnalysisStatusRefetchInterval(status: PollableStatus | undefined) {
  if (!status || status.status === 'COMPLETED' || status.status === 'FAILED') {
    return false
  }

  return 3000
}

export async function createAnalysisReport(
  request: AnalysisReportCreateRequest,
) {
  const api = await getApi()
  const response = await api.post<ApiResponse<AnalysisReportCreateResponse>>(
    '/analysis/reports',
    request,
  )
  return response.data.data
}

export async function fetchAnalysisReports() {
  const api = await getApi()
  const response = await api.get<ApiResponse<AnalysisReportSummary[]>>(
    '/analysis/reports',
  )
  return response.data.data
}

export async function fetchAnalysisStatus(reportId: string) {
  const api = await getApi()
  const response = await api.get<ApiResponse<AnalysisReportStatusResponse>>(
    `/analysis/reports/${reportId}/status`,
  )
  return response.data.data
}
