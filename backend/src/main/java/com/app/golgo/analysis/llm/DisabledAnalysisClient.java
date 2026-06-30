package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.service.AnalysisException;

public class DisabledAnalysisClient implements AnalysisLlmClient {

	private final String providerName;

	public DisabledAnalysisClient(String providerName) {
		this.providerName = providerName;
	}

	@Override
	public AnalysisStructuredResult analyze(AnalysisPromptRequest request) {
		throw AnalysisException.providerUnavailable(providerName + " provider is disabled");
	}
}
