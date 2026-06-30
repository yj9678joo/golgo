package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.entity.AnalysisType;
import com.app.golgo.analysis.entity.LlmProvider;

public record AnalysisPromptRequest(
	String ticker,
	AnalysisType analysisType,
	LlmProvider llmProvider
) {
}
