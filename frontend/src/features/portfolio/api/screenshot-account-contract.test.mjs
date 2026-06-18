import assert from 'node:assert/strict'
import test from 'node:test'
import { createScreenshotAccountPayload } from './screenshot-account-contract.ts'

test('MTS 캡처 계좌 생성 요청을 백엔드 DTO 계약에 맞춘다', () => {
  assert.deepEqual(createScreenshotAccountPayload(), {
    brokerCode: 'MTS',
    accountNickname: 'MTS 캡처 계좌',
  })
})
