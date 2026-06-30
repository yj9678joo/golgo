package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.entity.Recommendation;
import java.math.BigDecimal;
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

	public record DataVerification(
		String declaredAssetType,
		String verifiedAssetType,
		String dataSource,
		String dataAsOf,
		List<String> unavailableFields,
		List<String> warnings,
		int score
	) {
	}

	public record BusinessModel(String summary, List<String> revenueStreams, int score) {
	}

	public record IndustryStructure(String moat, String cyclePosition, List<String> competitors, int score) {
	}

	public record Financials(BigDecimal roic, BigDecimal fcfMarginPct, String earningsQuality, int score) {
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
	}

	public record EarningsCall(String guidanceChange, String managementTone, int score) {
	}

	public record MacroPolicy(String interestRateImpact, String fxImpact, String regulationRisk, int score) {
	}

	public record CatalystsAndRisks(
		List<String> catalysts,
		List<String> risks,
		String selfRebuttal,
		int score
	) {
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
	}
}
