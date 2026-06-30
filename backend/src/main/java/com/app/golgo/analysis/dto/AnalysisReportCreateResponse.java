package com.app.golgo.analysis.dto;

import java.util.UUID;

public record AnalysisReportCreateResponse(
	UUID reportId,
	String status,
	int estimatedSeconds
) {
}
