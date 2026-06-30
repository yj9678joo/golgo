package com.app.golgo.analysis.dto;

import com.fasterxml.jackson.databind.JsonNode;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

public record AnalysisReportResponse(
	UUID reportId,
	String ticker,
	String status,
	Instant generatedAt,
	Map<String, JsonNode> sections,
	String investmentThesis,
	BigDecimal overallScore,
	String recommendation
) {
}
