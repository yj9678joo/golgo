import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getPortfolioRefreshNotice } from './portfolio-detail-display.ts'

describe('portfolio detail display helpers', () => {
  it('does not show a refresh notice when every account is synced', () => {
    const notice = getPortfolioRefreshNotice([
      {
        accountNickname: '미래에셋 메인',
        syncStatus: 'SYNCED',
        daysSinceSync: 0,
      },
    ])

    assert.equal(notice, null)
  })

  it('shows a refresh notice for the first outdated account', () => {
    const notice = getPortfolioRefreshNotice([
      {
        accountNickname: '미래에셋 메인',
        syncStatus: 'SYNCED',
        daysSinceSync: 0,
      },
      {
        accountNickname: '한국투자 서브',
        syncStatus: 'OUTDATED',
        daysSinceSync: 3,
      },
    ])

    assert.deepEqual(notice, {
      title: '한국투자 서브 계좌가 3일 전 기준이에요',
      description: '최신 캡처로 리밸런싱 정확도를 높여요',
    })
  })
})
