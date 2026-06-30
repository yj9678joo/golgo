package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.entity.Recommendation;
import java.math.BigDecimal;
import java.util.List;

public record AnalysisStructuredResult(
	BusinessModel businessModel,
	IndustryStructure industryStructure,
	Financials financials,
	Valuation valuation,
	EarningsCall earningsCall,
	MacroPolicy macroPolicy,
	CatalystsAndRisks catalystsAndRisks,
	String investmentThesis,
	BigDecimal overallScore,
	Recommendation recommendation
) {

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
}
