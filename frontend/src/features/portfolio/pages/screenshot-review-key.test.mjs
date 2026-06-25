import test from 'node:test'
import assert from 'node:assert/strict'
import { getHoldingRowKey } from './screenshot-review-key.ts'

test('빈 종목 코드가 여러 개여도 보유 종목 row key를 고유하게 만든다', () => {
  const first = getHoldingRowKey({ symbol: '', name: 'TIGER 미국우주테크' }, 0)
  const second = getHoldingRowKey({ symbol: '', name: 'TIGER 미국나스닥100' }, 1)

  assert.notEqual(first, second)
})
