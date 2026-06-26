import test from 'node:test'
import assert from 'node:assert/strict'
import { replaceHoldingAt } from './screenshot-review-holdings.ts'

const baseHolding = {
  symbol: '',
  name: '',
  market: 'KRX',
  quantity: 1,
  averagePrice: 1000,
  currentPrice: 1000,
  currency: 'KRW',
  currentValueKrw: 1000,
  manuallyEdited: false,
}

test('종목 코드가 비어 있어도 선택한 보유 종목만 교체한다', () => {
  const first = { ...baseHolding, name: 'TIGER 미국우주테크' }
  const second = { ...baseHolding, name: 'TIGER 미국나스닥100' }
  const updated = { ...second, name: 'TIGER 미국S&P500', manuallyEdited: true }

  const nextHoldings = replaceHoldingAt([first, second], 1, updated)

  assert.deepEqual(nextHoldings, [first, updated])
})
