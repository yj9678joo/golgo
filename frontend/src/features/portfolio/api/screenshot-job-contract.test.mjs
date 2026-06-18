import assert from 'node:assert/strict'
import test from 'node:test'
import {
  mapScreenshotJobResponse,
  toHoldingPayload,
} from './screenshot-job-contract.ts'

const response = {
  jobId: 'job-id',
  status: 'PARSED',
  brokerCode: 'MTS',
  accountNickname: 'MTS 캡처 계좌',
  parsedAt: '2026-06-18T07:00:00Z',
  confirmedAt: null,
  confidence: 0.95,
  holdings: [
    {
      ticker: '005930',
      name: '삼성전자',
      market: 'KRX',
      quantity: 10,
      avgPrice: 70000,
      currentPrice: 75000,
      currency: 'KRW',
      currentValueKrw: 750000,
      manuallyEdited: false,
    },
  ],
  totalAssetKrw: 750000,
  warnings: [],
  errorReason: null,
  message: '분석 완료',
  estimatedSeconds: 0,
}

test('백엔드 분석 응답을 UI 보유 종목 필드로 변환한다', () => {
  const job = mapScreenshotJobResponse(response)

  assert.equal(job.brokerName, 'MTS')
  assert.equal(job.holdings[0].symbol, '005930')
  assert.equal(job.holdings[0].averagePrice, 70000)
})

test('UI 보유 종목을 백엔드 수정 요청 필드로 변환한다', () => {
  const holding = mapScreenshotJobResponse(response).holdings[0]

  assert.deepEqual(toHoldingPayload(holding), {
    ticker: '005930',
    name: '삼성전자',
    market: 'KRX',
    quantity: 10,
    avgPrice: 70000,
    currentPrice: 75000,
    currency: 'KRW',
  })
})
