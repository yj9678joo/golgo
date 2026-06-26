import type { PortfolioAccount } from '../types'

type PortfolioRefreshNotice = {
  title: string
  description: string
}

type RefreshNoticeAccount = Pick<PortfolioAccount, 'accountNickname' | 'syncStatus' | 'daysSinceSync'>

export function getPortfolioRefreshNotice(accounts: RefreshNoticeAccount[]): PortfolioRefreshNotice | null {
  const outdatedAccount = accounts.find((account) => account.syncStatus === 'OUTDATED' || account.syncStatus === 'ERROR')

  if (!outdatedAccount) {
    return null
  }

  return {
    title: outdatedAccount.daysSinceSync === null
      ? '포트폴리오 최신화가 필요해요'
      : `${outdatedAccount.accountNickname} 계좌가 ${outdatedAccount.daysSinceSync}일 전 기준이에요`,
    description: '최신 캡처로 리밸런싱 정확도를 높여요',
  }
}
