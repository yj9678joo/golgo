package com.app.golgo.analysis.dto;

import java.util.UUID;

public record AnalysisReportStatusResponse(
	UUID reportId,
	String status,
	int progressPct,
	String currentStep
) {
}
