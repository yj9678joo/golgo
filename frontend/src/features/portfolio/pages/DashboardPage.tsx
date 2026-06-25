import { ArrowRight, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppTabLayout } from '@/components/layout/AppTabLayout'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { SkeletonBlock } from '@/components/common/SkeletonBlock'
import { OutdatedPortfolioBanner } from '@/features/portfolio/components/OutdatedPortfolioBanner'
import { usePortfolio } from '@/features/portfolio/hooks/use-portfolio'
import {
  formatKrw,
  formatSignedPercent,
  getPortfolioHasOutdatedAccount,
} from '@/features/portfolio/utils/portfolio-display'

export function DashboardPage() {
  const navigate = useNavigate()
  const portfolioQuery = usePortfolio()
  const portfolio = portfolioQuery.data
  const outdatedAccount = portfolio?.accounts.find((account) =>
    getPortfolioHasOutdatedAccount(account.syncStatus),
  )

  return (
    <AppTabLayout>
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#03ba8c]">Golgo Dashboard</p>
          <h1 className="mt-2 text-[26px] font-semibold leading-[1.25] text-[#191F28]">
            내 포트폴리오를
            <br />
            한눈에 확인해요
          </h1>
        </div>
        <span className="flex size-11 items-center justify-center rounded-[15px] bg-white text-[#03ba8c]">
          <TrendingUp className="size-5" aria-hidden="true" />
        </span>
      </header>

      <div className="mt-6 grid gap-4">
        {portfolioQuery.isLoading ? (
          <>
            <SkeletonBlock className="h-[156px]" />
            <SkeletonBlock className="h-[100px]" />
            <SkeletonBlock className="h-[180px]" />
          </>
        ) : null}

        {portfolioQuery.isError ? (
          <ErrorState
            message="포트폴리오를 불러오지 못했어요."
            onRetry={() => void portfolioQuery.refetch()}
          />
        ) : null}

        {portfolio && portfolio.holdings.length === 0 ? (
          <EmptyState
            title="아직 보유 종목이 없어요"
            description="MTS 캡처를 업로드하면 포트폴리오 대시보드를 만들 수 있어요."
            action={
              <button
                className="h-12 rounded-[15px] bg-[#03ba8c] px-5 text-[14px] font-semibold text-white"
                type="button"
                onClick={() => navigate('/portfolio/screenshot')}
              >
                캡처 업로드
              </button>
            }
          />
        ) : null}

        {portfolio && portfolio.holdings.length > 0 ? (
          <>
            {outdatedAccount ? <OutdatedPortfolioBanner /> : null}

            <section className="rounded-[22px] bg-white p-5">
              <p className="text-[12px] font-semibold text-[#8B95A1]">총 자산</p>
              <p className="mt-2 text-[30px] font-semibold tracking-normal text-[#191F28]">
                {formatKrw(portfolio.totalAssetKrw)}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-[14px] bg-[#F2F4F6] p-3">
                  <p className="text-[11px] font-semibold text-[#8B95A1]">평가손익</p>
                  <p className="mt-1 text-[14px] font-semibold text-[#03ba8c]">
                    {formatKrw(portfolio.totalProfitKrw)}
                  </p>
                </div>
                <div className="rounded-[14px] bg-[#F2F4F6] p-3">
                  <p className="text-[11px] font-semibold text-[#8B95A1]">수익률</p>
                  <p className="mt-1 text-[14px] font-semibold text-[#03ba8c]">
                    {formatSignedPercent(portfolio.profitRate)}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[18px] bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[#191F28]">보유 종목</h2>
                <button
                  className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#03ba8c]"
                  type="button"
                  onClick={() => navigate('/portfolio')}
                >
                  상세
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="mt-3 grid gap-3">
                {portfolio.holdings.slice(0, 4).map((holding) => (
                  <div key={`${holding.accountId}-${holding.ticker ?? holding.name}`} className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] font-semibold text-[#191F28]">
                        {holding.name}
                      </p>
                      <p className="mt-1 text-[12px] text-[#6B7684]">{holding.market}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[13px] font-semibold text-[#191F28]">
                        {formatKrw(holding.currentValueKrw)}
                      </p>
                      <p
                        className={`mt-1 text-[12px] font-semibold ${
                          holding.profitRate >= 0 ? 'text-[#03ba8c]' : 'text-[#E5484D]'
                        }`}
                      >
                        {formatSignedPercent(holding.profitRate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </div>
    </AppTabLayout>
  )
}
