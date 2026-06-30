package com.app.golgo.analysis.llm;

public interface AnalysisLlmClient {

	AnalysisStructuredResult analyze(AnalysisPromptRequest request);
}
