import { ArrowRight, Bot, RefreshCw, Settings } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";
import { AppTabLayout } from "@/components/layout/AppTabLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { OutdatedPortfolioBanner } from "@/features/portfolio/components/OutdatedPortfolioBanner";
import {
  usePortfolio,
  usePortfolioHistory,
} from "@/features/portfolio/hooks/use-portfolio";
import type {
  PortfolioHistoryPeriod,
  PortfolioHolding,
} from "@/features/portfolio/types";
import {
  buildPortfolioHistorySeries,
  formatCompactKrw,
  formatKrw,
  formatSignedPercent,
  getKoreanProfitTone,
  getPortfolioHasOutdatedAccount,
  getPortfolioOwnerLabel,
  getSparklineLimit,
} from "@/features/portfolio/utils/portfolio-display";

const PERIODS: PortfolioHistoryPeriod[] = ["1W", "1M", "3M", "6M", "1Y", "ALL"];

export function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PortfolioHistoryPeriod>("3M");
  const user = useAuthStore((state) => state.user);
  const portfolioQuery = usePortfolio();
  const historyQuery = usePortfolioHistory(period);
  const portfolio = portfolioQuery.data;
  const outdatedAccount = portfolio?.accounts.find((account) =>
    getPortfolioHasOutdatedAccount(account.syncStatus),
  );
  const historySeries = buildPortfolioHistorySeries(historyQuery.data).slice(
    -getSparklineLimit(period),
  );
  const profitTone = getKoreanProfitTone(portfolio?.totalProfitKrw ?? 0);
  const profitColorClass = getProfitColorClass(profitTone);
  const profitBadgeClass = getProfitBadgeClass(profitTone);
  const profitChartColor = getProfitChartColor(profitTone);

  return (
    <AppTabLayout>
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#8B95A1]">
            안녕하세요🖐️
          </p>
          <h1 className="mt-1 text-[22px] font-semibold leading-[1.3] text-[#191F28]">
            {getPortfolioOwnerLabel(user?.nickname)}
          </h1>
        </div>
        <Button
          className="flex size-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-[#4E5968] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]"
          type="button"
          variant="ghost"
          aria-label="설정"
          aria-disabled="true"
        >
          <Settings className="size-5" aria-hidden="true" />
        </Button>
      </header>

      <div className="mt-5 grid gap-3">
        {portfolioQuery.isLoading ? (
          <>
            <SkeletonBlock className="h-[280px]" />
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
              <Button
                className="h-12 rounded-[15px] bg-[#03ba8c] px-5 text-[14px] font-semibold text-white"
                type="button"
                onClick={() => navigate("/portfolio/screenshot")}
              >
                캡처 업로드
              </Button>
            }
          />
        ) : null}

        {portfolio && portfolio.holdings.length > 0 ? (
          <>
            {outdatedAccount ? <OutdatedPortfolioBanner /> : null}

            <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-[#8B95A1]">
                  총 평가금액
                </p>
                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${profitBadgeClass}`}
                >
                  {formatSignedPercent(portfolio.profitRate)}
                </span>
              </div>
              <p className="mt-2 whitespace-nowrap font-mono text-[30px] font-bold leading-none tracking-normal text-[#191F28]">
                {formatKrw(portfolio.totalAssetKrw)}
              </p>
              <p
                className={`mt-2 font-mono text-[13px] font-semibold ${profitColorClass}`}
              >
                {formatKrw(portfolio.totalProfitKrw)}
                <span className="ml-1 font-sans font-medium text-[#8B95A1]">
                  원금 대비
                </span>
              </p>

              <div className="mt-4 grid grid-cols-6 gap-1 rounded-[12px] bg-[#F7F8FA] p-1">
                {PERIODS.map((item) => (
                  <Button
                    key={item}
                    className={`h-8 rounded-[9px] px-0 text-[11px] font-semibold transition ${
                      period === item
                        ? "bg-white text-[#191F28] shadow-sm"
                        : "text-[#8B95A1]"
                    }`}
                    type="button"
                    variant="ghost"
                    onClick={() => setPeriod(item)}
                  >
                    {item === "ALL" ? "전체" : item}
                  </Button>
                ))}
              </div>

              <div className="mt-3 h-[104px]">
                {historyQuery.isLoading ? (
                  <SkeletonBlock className="h-full" />
                ) : historySeries.length >= 2 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={historySeries}
                      margin={{ top: 10, right: 2, bottom: 0, left: 2 }}
                    >
                      <defs>
                        <linearGradient
                          id="dashboardAssetFill"
                          x1="0"
                          x2="0"
                          y1="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor={profitChartColor}
                            stopOpacity={0.24}
                          />
                          <stop
                            offset="100%"
                            stopColor={profitChartColor}
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <Tooltip content={<HistoryTooltip />} cursor={false} />
                      <Area
                        dataKey="value"
                        fill="url(#dashboardAssetFill)"
                        stroke={profitChartColor}
                        strokeLinecap="round"
                        strokeWidth={2.5}
                        type="monotone"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center rounded-[14px] bg-[#F7F8FA] text-[12px] font-semibold text-[#8B95A1]">
                    자산 추이 데이터가 아직 없어요
                  </div>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 border-t border-[#F2F4F6] pt-3">
                <AssetStat
                  label="평가손익"
                  value={`${formatCompactKrw(portfolio.totalProfitKrw)}원`}
                />
                <AssetStat
                  label="수익률"
                  value={formatSignedPercent(portfolio.profitRate)}
                />
                <AssetStat
                  label="보유 종목"
                  value={`${portfolio.holdings.length}개`}
                />
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              <QuickActionTile
                icon={<Bot className="size-5" aria-hidden="true" />}
                label="오늘의 분석"
                sub="AI 리포트 보기"
                onClick={() => navigate("/analysis")}
              />
              <QuickActionTile
                icon={<RefreshCw className="size-5" aria-hidden="true" />}
                label="리밸런싱"
                sub="목표 비중 점검"
                onClick={() => navigate("/rebalancing")}
              />
            </div>

            <Card className="rounded-[20px] border-0 bg-white px-4 pb-2 pt-3 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <h2 className="text-[16px] font-semibold text-[#191F28]">
                  보유 종목
                </h2>
                <Button
                  className="inline-flex h-auto items-center gap-1 bg-transparent px-0 text-[12px] font-semibold text-[#8B95A1] hover:bg-transparent"
                  type="button"
                  variant="ghost"
                  onClick={() => navigate("/portfolio")}
                >
                  전체보기
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
              <div className="mt-2 divide-y divide-[#F2F4F6]">
                {portfolio.holdings.slice(0, 4).map((holding) => (
                  <HoldingRow
                    key={`${holding.accountId}-${holding.ticker ?? holding.name}`}
                    holding={holding}
                  />
                ))}
              </div>
            </Card>
          </>
        ) : null}
      </div>
    </AppTabLayout>
  );
}

function HistoryTooltip({ active, payload }: TooltipProps<number, string>) {
  const value = payload?.[0]?.value;

  if (!active || typeof value !== "number") {
    return null;
  }

  return (
    <div className="rounded-[10px] bg-[#191F28] px-3 py-2 text-[12px] font-semibold text-white shadow-lg">
      {formatKrw(value)}
    </div>
  );
}

function AssetStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="truncate text-[11px] font-semibold text-[#8B95A1]">
        {label}
      </p>
      <p className="mt-1 truncate font-mono text-[13px] font-bold text-[#191F28]">
        {value}
      </p>
    </div>
  );
}

function QuickActionTile({
  icon,
  label,
  sub,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <Button
      className="block rounded-[18px] bg-white p-4 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]"
      type="button"
      variant="ghost"
      onClick={onClick}
    >
      <span className="flex size-9 items-center justify-center rounded-[12px] bg-[#F2F4F6] text-[#03ba8c]">
        {icon}
      </span>
      <span className="mt-3 block text-[14px] font-semibold text-[#191F28]">
        {label}
      </span>
      <span className="mt-1 block truncate text-[12px] font-medium text-[#8B95A1]">
        {sub}
      </span>
    </Button>
  );
}

function HoldingRow({ holding }: { holding: PortfolioHolding }) {
  const profitColorClass = getProfitColorClass(
    getKoreanProfitTone(holding.profitRate),
  );

  return (
    <div className="flex min-w-0 items-center py-3">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-[14px] font-semibold text-[#191F28]">
            {holding.name}
          </p>
          <span className="shrink-0 rounded-full bg-[#F2F4F6] px-2 py-0.5 font-mono text-[10px] font-bold text-[#4E5968]">
            {holding.ticker ?? holding.market}
          </span>
        </div>
        <p className="mt-1 truncate text-[12px] text-[#8B95A1]">
          {holding.quantity.toLocaleString("ko-KR")}주 · 평단{" "}
          {formatCompactKrw(holding.avgPrice)}원 · {holding.market}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[13px] font-bold text-[#191F28]">
          {formatCompactKrw(holding.currentValueKrw)}원
        </p>
        <p
          className={`mt-1 font-mono text-[12px] font-semibold ${profitColorClass}`}
        >
          {formatSignedPercent(holding.profitRate)}
        </p>
      </div>
    </div>
  );
}

function getProfitColorClass(tone: ReturnType<typeof getKoreanProfitTone>) {
  if (tone === "profit") {
    return "text-[#D92D3A]";
  }

  if (tone === "loss") {
    return "text-[#1E64D8]";
  }

  return "text-[#4E5968]";
}

function getProfitBadgeClass(tone: ReturnType<typeof getKoreanProfitTone>) {
  if (tone === "profit") {
    return "bg-[#FEECEF] text-[#D92D3A]";
  }

  if (tone === "loss") {
    return "bg-[#EAF2FF] text-[#1E64D8]";
  }

  return "bg-[#F2F4F6] text-[#4E5968]";
}

function getProfitChartColor(tone: ReturnType<typeof getKoreanProfitTone>) {
  if (tone === "profit") {
    return "#D92D3A";
  }

  if (tone === "loss") {
    return "#1E64D8";
  }

  return "#4E5968";
}
