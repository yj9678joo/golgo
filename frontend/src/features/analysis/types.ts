export type AnalysisType = 'QUICK' | 'DEEP_INFERENCE'

export type LlmProvider = 'GEMINI' | 'GPT' | 'CLAUDE'

export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'

export type Recommendation = 'BUY' | 'HOLD' | 'SELL'

export type AnalysisReportCreateRequest = {
  ticker: string
  analysisType: AnalysisType
  llmProvider: LlmProvider
}

export type AnalysisReportCreateResponse = {
  reportId: string
  status: AnalysisStatus
  estimatedSeconds: number
}

export type AnalysisReportStatusResponse = {
  reportId: string
  status: AnalysisStatus
  progressPct: number
  currentStep: string | null
}

export type AnalysisReportSummary = {
  reportId: string
  ticker: string
  analysisType: AnalysisType
  llmProvider: LlmProvider
  status: AnalysisStatus
  requestedAt: string
  generatedAt: string | null
  overallScore: number | null
  recommendation: Recommendation | null
}
