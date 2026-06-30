package com.app.golgo.analysis.config;

import com.app.golgo.analysis.llm.AnalysisLlmClient;
import com.app.golgo.analysis.llm.AnalysisPromptFactory;
import com.app.golgo.analysis.llm.DisabledAnalysisClient;
import com.app.golgo.analysis.llm.FallbackAnalysisClient;
import com.app.golgo.analysis.llm.GeminiAnalysisClient;
import com.app.golgo.analysis.llm.GeminiAnalysisProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties(GeminiAnalysisProperties.class)
public class AnalysisLlmConfiguration {

	@Bean
	AnalysisPromptFactory analysisPromptFactory() {
		return new AnalysisPromptFactory();
	}

	@Bean
	AnalysisLlmClient analysisLlmClient(
		RestClient.Builder builder,
		ObjectMapper objectMapper,
		AnalysisPromptFactory promptFactory,
		GeminiAnalysisProperties properties
	) {
		SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
		requestFactory.setConnectTimeout(Duration.ofSeconds(10));
		requestFactory.setReadTimeout(Duration.ofSeconds(properties.timeoutSeconds()));
		AnalysisLlmClient gemini = new GeminiAnalysisClient(
			builder.baseUrl(properties.baseUrl())
				.defaultHeader("x-goog-api-key", properties.apiKey())
				.requestFactory(requestFactory)
				.build(),
			objectMapper,
			promptFactory,
			properties
		);
		return new FallbackAnalysisClient(List.of(
			gemini,
			new DisabledAnalysisClient("GPT"),
			new DisabledAnalysisClient("Claude")
		));
	}
}
