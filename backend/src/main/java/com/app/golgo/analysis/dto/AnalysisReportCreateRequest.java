package com.app.golgo.analysis.dto;

import com.app.golgo.analysis.entity.AssetType;
import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AnalysisReportCreateRequest(
	@NotBlank @Size(max = 20) String ticker,
	@NotNull AssetType assetType,
	AnalysisType analysisType,
	LlmProvider llmProvider
) {
}
