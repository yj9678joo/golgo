import assert from 'node:assert/strict'
import test from 'node:test'
import {
  ANALYSIS_STATUS_LABELS,
  createAnalysisReportPayload,
  getAnalysisStatusRefetchInterval,
} from './analysis-api.ts'

test('분석 생성 요청은 백엔드 DTO 키를 사용한다', () => {
  assert.deepEqual(createAnalysisReportPayload(' nvda ', 'GEMINI'), {
    ticker: 'NVDA',
    analysisType: 'DEEP_INFERENCE',
    llmProvider: 'GEMINI',
  })
})

test('분석 상태 라벨을 표시 문구로 변환한다', () => {
  assert.deepEqual(ANALYSIS_STATUS_LABELS, {
    PENDING: '대기 중',
    PROCESSING: '분석 중',
    COMPLETED: '완료',
    FAILED: '실패',
  })
})

test('분석 상태 폴링은 terminal 상태에서 중단한다', () => {
  assert.equal(getAnalysisStatusRefetchInterval({ status: 'PENDING' }), 3000)
  assert.equal(getAnalysisStatusRefetchInterval({ status: 'PROCESSING' }), 3000)
  assert.equal(getAnalysisStatusRefetchInterval({ status: 'COMPLETED' }), false)
  assert.equal(getAnalysisStatusRefetchInterval({ status: 'FAILED' }), false)
  assert.equal(getAnalysisStatusRefetchInterval(undefined), false)
})
