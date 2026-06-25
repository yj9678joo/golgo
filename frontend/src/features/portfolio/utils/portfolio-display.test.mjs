import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatKrw,
  formatSignedPercent,
  getPortfolioHasOutdatedAccount,
  getTargetWeight,
} from './portfolio-display.ts'

describe('portfolio display helpers', () => {
  it('formats KRW and signed rates for dashboard cards', () => {
    assert.equal(formatKrw(12500000.2), '12,500,000원')
    assert.equal(formatSignedPercent(13.6), '+13.60%')
    assert.equal(formatSignedPercent(-2.25), '-2.25%')
  })

  it('derives stable target weights without backend strategy data', () => {
    const unknown = { ticker: 'MSFT' }
    const samsung = { ticker: '005930' }

    assert.equal(getTargetWeight(samsung, 0, 3), 30)
    assert.equal(getTargetWeight(unknown, 0, 3), 33.3)
    assert.equal(getTargetWeight(unknown, 2, 3), 33.4)
  })

  it('shows refresh nudges for outdated or errored accounts only', () => {
    assert.equal(getPortfolioHasOutdatedAccount('OUTDATED'), true)
    assert.equal(getPortfolioHasOutdatedAccount('ERROR'), true)
    assert.equal(getPortfolioHasOutdatedAccount('SYNCED'), false)
  })
})
