package com.app.golgo.analysis.llm;

import com.app.golgo.analysis.service.AnalysisException;
import java.util.List;

public class FallbackAnalysisClient implements AnalysisLlmClient {

	private final List<AnalysisLlmClient> clients;

	public FallbackAnalysisClient(List<AnalysisLlmClient> clients) {
		this.clients = clients;
	}

	@Override
	public AnalysisStructuredResult analyze(AnalysisPromptRequest request) {
		AnalysisException lastRetryable = null;
		for (AnalysisLlmClient client : clients) {
			try {
				return client.analyze(request);
			} catch (AnalysisException exception) {
				if (!exception.retryable()) {
					throw exception;
				}
				if (lastRetryable == null || !exception.getMessage().endsWith("provider is disabled")) {
					lastRetryable = exception;
				}
			}
		}
		throw lastRetryable == null
			? AnalysisException.providerUnavailable("사용 가능한 LLM provider가 없습니다.")
			: lastRetryable;
	}
}
