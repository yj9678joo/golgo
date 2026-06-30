package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.AssetType;
import com.app.golgo.analysis.entity.LlmProvider;

public record AnalysisPromptRequest(
	String ticker,
	AssetType assetType,
	AnalysisType analysisType,
	LlmProvider llmProvider
) {
}
