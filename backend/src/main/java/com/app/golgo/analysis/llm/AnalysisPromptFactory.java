package com.app.golgo.analysis.llm;

public class AnalysisPromptFactory {

	public String createSystemPrompt() {
		return """
			Return only valid JSON matching the provided schema.
			Analyze as a 50-year veteran investment analyst.
			Use these seven sections: businessModel, industryStructure, financials, valuation, earningsCall, macroPolicy, catalystsAndRisks.
			In valuation, cross-check PER, PEG, PBR, and PSR. If metrics conflict, connect the warning to macro conditions and mention possible position reduction.
			Do not guarantee profit. Do not invent unavailable facts. If data is unavailable, write null or an explicit limitation.
			""";
	}

	public String createUserPrompt(AnalysisPromptRequest request) {
		return """
			Analyze ticker: %s
			Analysis type: %s
			Preferred provider: %s
			""".formatted(request.ticker(), request.analysisType(), request.llmProvider());
	}
}
