package com.app.golgo.analysis.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AnalysisReportSummaryResponse(
	UUID reportId,
	String ticker,
	String assetType,
	String analysisType,
	String llmProvider,
	String status,
	BigDecimal overallScore,
	String recommendation,
	Instant requestedAt,
	Instant generatedAt
) {
}
