import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPortfolioHistorySeries,
  estimateHoldingProfitKrw,
  formatCompactKrw,
  formatKrw,
  formatSignedPercent,
  getKoreanProfitTone,
  getPortfolioHasOutdatedAccount,
  getPortfolioOwnerLabel,
  getSparklineLimit,
  getTargetWeight,
  getTickerBadgeLabel,
} from './portfolio-display.ts'

describe('portfolio display helpers', () => {
  it('formats KRW and signed rates for dashboard cards', () => {
    assert.equal(formatKrw(12500000.2), '12,500,000원')
    assert.equal(formatCompactKrw(12500000.2), '1,250만')
    assert.equal(formatCompactKrw(-340000), '-34만')
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

  it('normalizes history snapshots into sparkline values', () => {
    const history = buildPortfolioHistorySeries({
      period: '1M',
      snapshots: [
        { date: '2026-06-23', totalAssetKrw: 1200000 },
        { date: '2026-06-24', totalAssetKrw: 1250000 },
        { date: '2026-06-25', totalAssetKrw: 1230000 },
      ],
    })

    assert.deepEqual(history, [
      { date: '2026-06-23', value: 1200000 },
      { date: '2026-06-24', value: 1250000 },
      { date: '2026-06-25', value: 1230000 },
    ])
  })

  it('limits sparkline points by selected period', () => {
    assert.equal(getSparklineLimit('1W'), 7)
    assert.equal(getSparklineLimit('1M'), 30)
    assert.equal(getSparklineLimit('3M'), 90)
    assert.equal(getSparklineLimit('ALL'), 365)
    assert.equal(getSparklineLimit('unknown'), 90)
  })

  it('creates compact ticker badge labels', () => {
    assert.equal(getTickerBadgeLabel('005930', '삼성전자'), '0059')
    assert.equal(getTickerBadgeLabel('QQQ', 'Invesco QQQ'), 'QQQ')
    assert.equal(getTickerBadgeLabel(null, 'Apple'), 'APPL')
  })

  it('estimates profit amount from holding value and profit rate', () => {
    assert.equal(estimateHoldingProfitKrw(110000, 10), 10000)
    assert.equal(estimateHoldingProfitKrw(80000, -20), -20000)
    assert.equal(estimateHoldingProfitKrw(100000, -100), 0)
  })

  it('maps profit values to Korean trading colors', () => {
    assert.equal(getKoreanProfitTone(1), 'profit')
    assert.equal(getKoreanProfitTone(0), 'flat')
    assert.equal(getKoreanProfitTone(-1), 'loss')
  })

  it('derives portfolio owner label from the first account nickname', () => {
    assert.equal(
      getPortfolioOwnerLabel({
        accounts: [{ accountNickname: '용주' }],
      }),
      '용주님',
    )
    assert.equal(getPortfolioOwnerLabel({ accounts: [{ accountNickname: '' }] }), '투자자님')
    assert.equal(getPortfolioOwnerLabel(undefined), '투자자님')
  })
})
