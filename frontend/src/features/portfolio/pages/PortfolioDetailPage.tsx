import { AppTabLayout } from '@/components/layout/AppTabLayout'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { SkeletonBlock } from '@/components/common/SkeletonBlock'
import { AccountSyncStatusCard } from '@/features/portfolio/components/AccountSyncStatusCard'
import { AssetDonutChart } from '@/features/portfolio/components/AssetDonutChart'
import { OutdatedPortfolioBanner } from '@/features/portfolio/components/OutdatedPortfolioBanner'
import { WeightComparisonBar } from '@/features/portfolio/components/WeightComparisonBar'
import { usePortfolio } from '@/features/portfolio/hooks/use-portfolio'
import {
  formatKrw,
  getPortfolioHasOutdatedAccount,
} from '@/features/portfolio/utils/portfolio-display'

export function PortfolioDetailPage() {
  const portfolioQuery = usePortfolio()
  const portfolio = portfolioQuery.data
  const outdatedAccount = portfolio?.accounts.find((account) =>
    getPortfolioHasOutdatedAccount(account.syncStatus),
  )

  return (
    <AppTabLayout>
      <header>
        <p className="text-[13px] font-semibold text-[#03ba8c]">Portfolio</p>
        <h1 className="mt-2 text-[26px] font-semibold leading-[1.25] text-[#191F28]">
          자산 비중과 목표를
          <br />
          비교해볼게요
        </h1>
      </header>

      <div className="mt-6 grid gap-4">
        {portfolioQuery.isLoading ? (
          <>
            <SkeletonBlock className="h-[280px]" />
            <SkeletonBlock className="h-[160px]" />
            <SkeletonBlock className="h-[220px]" />
          </>
        ) : null}

        {portfolioQuery.isError ? (
          <ErrorState
            message="포트폴리오 상세를 불러오지 못했어요."
            onRetry={() => void portfolioQuery.refetch()}
          />
        ) : null}

        {portfolio && portfolio.holdings.length === 0 ? (
          <EmptyState
            title="비교할 보유 종목이 없어요"
            description="캡처 업로드 후 종목을 확정하면 자산 비중 차트를 볼 수 있어요."
          />
        ) : null}

        {portfolio && portfolio.holdings.length > 0 ? (
          <>
            {outdatedAccount ? (
              <OutdatedPortfolioBanner
                message={
                  outdatedAccount.daysSinceSync === null
                    ? null
                    : `${outdatedAccount.accountNickname} 계좌가 ${outdatedAccount.daysSinceSync}일 전 기준입니다.`
                }
              />
            ) : null}

            <section className="rounded-[22px] bg-[#191F28] p-5 text-white">
              <p className="text-[12px] font-semibold text-white/60">평가 금액</p>
              <p className="mt-2 text-[28px] font-semibold">{formatKrw(portfolio.totalAssetKrw)}</p>
              <p className="mt-2 text-[13px] text-white/65">
                총 {portfolio.holdings.length}개 종목 · {portfolio.accounts.length}개 계좌
              </p>
            </section>

            <AssetDonutChart holdings={portfolio.holdings} />

            <section>
              <h2 className="mb-3 text-[16px] font-semibold text-[#191F28]">
                현재 vs 목표 비중
              </h2>
              <div className="grid gap-3">
                {portfolio.holdings.map((holding, index) => (
                  <WeightComparisonBar
                    key={`${holding.accountId}-${holding.ticker ?? holding.name}`}
                    holding={holding}
                    index={index}
                    count={portfolio.holdings.length}
                  />
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-[16px] font-semibold text-[#191F28]">계좌 동기화</h2>
              <div className="grid gap-3">
                {portfolio.accounts.map((account) => (
                  <AccountSyncStatusCard key={account.accountId} account={account} />
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppTabLayout>
  )
}
