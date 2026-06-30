package com.app.golgo.analysis.llm;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "golgo.analysis.gemini")
public record GeminiAnalysisProperties(
	String apiKey,
	String model,
	String baseUrl,
	int timeoutSeconds
) {
}
