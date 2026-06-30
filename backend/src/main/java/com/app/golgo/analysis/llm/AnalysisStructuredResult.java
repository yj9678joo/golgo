package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.entity.Recommendation;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public record AnalysisStructuredResult(
	DataVerification dataVerification,
	BusinessModel businessModel,
	IndustryStructure industryStructure,
	Financials financials,
	Valuation valuation,
	EarningsCall earningsCall,
	MacroPolicy macroPolicy,
	CatalystsAndRisks catalystsAndRisks,
	EtfAnalysis etfAnalysis,
	String investmentThesis,
	BigDecimal overallScore,
	Recommendation recommendation
) {

	public AnalysisStructuredResult {
		overallScore = normalizeScore(overallScore);
	}

	public record DataVerification(
		String declaredAssetType,
		String verifiedAssetType,
		String dataSource,
		String dataAsOf,
		List<String> unavailableFields,
		List<String> warnings,
		int score
	) {
		public DataVerification {
			score = normalizeScore(score);
		}
	}

	public record BusinessModel(String summary, List<String> revenueStreams, int score) {
		public BusinessModel {
			score = normalizeScore(score);
		}
	}

	public record IndustryStructure(String moat, String cyclePosition, List<String> competitors, int score) {
		public IndustryStructure {
			score = normalizeScore(score);
		}
	}

	public record Financials(BigDecimal roic, BigDecimal fcfMarginPct, String earningsQuality, int score) {
		public Financials {
			score = normalizeScore(score);
		}
	}

	public record Valuation(
		BigDecimal per,
		BigDecimal peg,
		BigDecimal pbr,
		BigDecimal psr,
		BigDecimal dcfFairValue,
		String judgment,
		int score
	) {
		public Valuation {
			score = normalizeScore(score);
		}
	}

	public record EarningsCall(String guidanceChange, String managementTone, int score) {
		public EarningsCall {
			score = normalizeScore(score);
		}
	}

	public record MacroPolicy(String interestRateImpact, String fxImpact, String regulationRisk, int score) {
		public MacroPolicy {
			score = normalizeScore(score);
		}
	}

	public record CatalystsAndRisks(
		List<String> catalysts,
		List<String> risks,
		String selfRebuttal,
		int score
	) {
		public CatalystsAndRisks {
			score = normalizeScore(score);
		}
	}

	public record EtfAnalysis(
		String indexName,
		String issuer,
		String replicationMethod,
		BigDecimal nav,
		BigDecimal marketPrice,
		BigDecimal premiumDiscountPct,
		BigDecimal expenseRatioPct,
		BigDecimal aum,
		BigDecimal trackingErrorPct,
		BigDecimal averageDailyTradingValue,
		String bidAskSpread,
		List<String> topHoldings,
		List<String> exposures,
		String leverageInverseSynthetic,
		String currencyHedge,
		String liquidityRisk,
		int score
	) {
		public EtfAnalysis {
			score = normalizeScore(score);
		}
	}

	private static int normalizeScore(int score) {
		if (score > 10 && score <= 100) {
			return Math.round(score / 10.0f);
		}
		return Math.max(0, Math.min(10, score));
	}

	private static BigDecimal normalizeScore(BigDecimal score) {
		if (score == null) {
			return null;
		}
		if (score.compareTo(BigDecimal.TEN) > 0 && score.compareTo(new BigDecimal("100")) <= 0) {
			return score.divide(BigDecimal.TEN).setScale(2, RoundingMode.HALF_UP);
		}
		if (score.compareTo(BigDecimal.ZERO) < 0) {
			return BigDecimal.ZERO;
		}
		if (score.compareTo(BigDecimal.TEN) > 0) {
			return BigDecimal.TEN;
		}
		return score.setScale(2, RoundingMode.HALF_UP);
	}
}
