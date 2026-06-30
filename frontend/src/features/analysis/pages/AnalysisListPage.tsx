import { Bot, ChevronRight, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { AppTabLayout } from "@/components/layout/AppTabLayout";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { SkeletonBlock } from "@/components/common/SkeletonBlock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AnalysisProgressCard } from "@/features/analysis/components/AnalysisProgressCard";
import {
  ANALYSIS_STATUS_LABELS,
  createAnalysisReportPayload,
} from "@/features/analysis/api/analysis-api";
import {
  useAnalysisReports,
  useCreateAnalysisReport,
} from "@/features/analysis/hooks/use-analysis-reports";
import { useAnalysisStatus } from "@/features/analysis/hooks/use-analysis-status";
import type {
  AnalysisReportSummary,
  AnalysisStatus,
  Recommendation,
} from "@/features/analysis/types";

const DEFAULT_PROVIDER = "GEMINI";

export function AnalysisListPage() {
  const [ticker, setTicker] = useState("");
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const reportsQuery = useAnalysisReports();
  const createMutation = useCreateAnalysisReport();
  const reports = useMemo(() => reportsQuery.data ?? [], [reportsQuery.data]);
  const inFlightReport = useMemo(
    () =>
      reports.find(
        (report) =>
          report.status === "PENDING" || report.status === "PROCESSING",
      ),
    [reports],
  );
  const progressReportId = activeReportId ?? inFlightReport?.reportId ?? null;
  const progressQuery = useAnalysisStatus(progressReportId);
  const normalizedTicker = ticker.trim().toUpperCase();
  const canSubmit = normalizedTicker.length > 0 && !createMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const report = await createMutation.mutateAsync(
      createAnalysisReportPayload(normalizedTicker, DEFAULT_PROVIDER),
    );
    setActiveReportId(report.reportId);
    setTicker("");
  }

  return (
    <AppTabLayout>
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#8B95A1]">AI 분석</p>
          <h1 className="mt-1 text-[22px] font-semibold leading-[1.3] text-[#191F28]">
            종목 리포트
          </h1>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center rounded-[15px] bg-white text-[#03ba8c] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
          <Bot className="size-5" aria-hidden="true" />
        </span>
      </header>

      <div className="mt-5 grid gap-3">
        <Card className="rounded-[20px] border-0 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div>
              <label
                className="text-[12px] font-semibold text-[#8B95A1]"
                htmlFor="analysis-ticker"
              >
                종목코드
              </label>
              <Input
                id="analysis-ticker"
                className="mt-2 h-12 rounded-[14px] border-[#E5E8EB] bg-[#F7F8FA] font-mono text-[16px] font-bold uppercase text-[#191F28]"
                maxLength={20}
                placeholder="종목 코드를 입력해주세요."
                value={ticker}
                onChange={(event) => setTicker(event.target.value)}
              />
            </div>

            {createMutation.isError ? (
              <p className="text-[12px] font-semibold text-[#E5484D]">
                분석 요청을 생성하지 못했어요. 잠시 후 다시 시도해 주세요.
              </p>
            ) : null}

            <Button
              className="h-12 rounded-[15px] bg-[#03ba8c] text-[15px] font-semibold text-white"
              disabled={!canSubmit}
              type="submit"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              분석 시작
            </Button>
          </form>
        </Card>

        <AnalysisProgressCard
          isLoading={progressQuery.isLoading}
          status={progressQuery.data}
        />

        {reportsQuery.isLoading ? (
          <>
            <SkeletonBlock className="h-[92px]" />
            <SkeletonBlock className="h-[92px]" />
          </>
        ) : null}

        {reportsQuery.isError ? (
          <ErrorState
            message="분석 리포트를 불러오지 못했어요."
            onRetry={() => void reportsQuery.refetch()}
          />
        ) : null}

        {reportsQuery.isSuccess && reports.length === 0 ? (
          <EmptyState
            title="아직 분석 리포트가 없어요"
            description="궁금한 종목코드를 입력하면 7단계 AI 분석을 시작할 수 있어요."
          />
        ) : null}

        {reports.length > 0 ? (
          <section className="rounded-[20px] bg-white px-4 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.04)]">
            <h2 className="px-1 py-3 text-[16px] font-semibold text-[#191F28]">
              최근 리포트
            </h2>
            <div className="divide-y divide-[#F2F4F6]">
              {reports.map((report) => (
                <ReportRow key={report.reportId} report={report} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </AppTabLayout>
  );
}

function ReportRow({ report }: { report: AnalysisReportSummary }) {
  return (
    <div className="flex min-w-0 items-center gap-3 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate font-mono text-[15px] font-bold text-[#191F28]">
            {report.ticker}
          </p>
          <StatusBadge status={report.status} />
        </div>
        <p className="mt-1 truncate text-[12px] font-medium text-[#8B95A1]">
          {formatReportDate(report)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono text-[13px] font-bold text-[#191F28]">
          {report.overallScore == null ? "-" : report.overallScore.toFixed(1)}
        </p>
        <p
          className={`mt-1 text-[11px] font-bold ${getRecommendationClass(report.recommendation)}`}
        >
          {report.recommendation ?? "분석 전"}
        </p>
      </div>
      <ChevronRight
        className="size-4 shrink-0 text-[#B0B8C1]"
        aria-hidden="true"
      />
    </div>
  );
}

function StatusBadge({ status }: { status: AnalysisStatus }) {
  return (
    <Badge
      className={`rounded-full border-0 px-2 py-0.5 text-[10px] ${getStatusClass(status)}`}
    >
      {ANALYSIS_STATUS_LABELS[status]}
    </Badge>
  );
}

function formatReportDate(report: AnalysisReportSummary) {
  const requestedAt = new Date(report.generatedAt ?? report.requestedAt);

  if (Number.isNaN(requestedAt.getTime())) {
    return "";
  }

  return requestedAt.toLocaleDateString("ko-KR");
}

function getStatusClass(status: AnalysisStatus) {
  if (status === "COMPLETED") {
    return "bg-[#E9FBF6] text-[#008F6B]";
  }

  if (status === "FAILED") {
    return "bg-[#FEECEF] text-[#D92D3A]";
  }

  return "bg-[#FFF4E5] text-[#F79009]";
}

function getRecommendationClass(recommendation: Recommendation | null) {
  if (recommendation === "BUY") {
    return "text-[#D92D3A]";
  }

  if (recommendation === "SELL") {
    return "text-[#1E64D8]";
  }

  return "text-[#4E5968]";
}
