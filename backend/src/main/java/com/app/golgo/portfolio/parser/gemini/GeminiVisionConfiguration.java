package com.app.golgo.portfolio.parser.gemini;

import com.app.golgo.portfolio.parser.ScreenshotParser;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
@ConditionalOnProperty(prefix = "golgo.screenshot", name = "parser", havingValue = "gemini")
@EnableConfigurationProperties(GeminiVisionProperties.class)
public class GeminiVisionConfiguration {

	@Bean
	GeminiVisionClient geminiVisionClient(
		RestClient.Builder builder,
		ObjectMapper objectMapper,
		GeminiVisionProperties properties
	) {
		SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
		requestFactory.setConnectTimeout(Duration.ofSeconds(10));
		requestFactory.setReadTimeout(Duration.ofSeconds(30));
		RestClient restClient = builder
			.baseUrl(properties.baseUrl())
			.defaultHeader("x-goog-api-key", properties.apiKey())
			.requestFactory(requestFactory)
			.build();
		return new GoogleGeminiVisionClient(restClient, objectMapper, properties);
	}

	@Bean
	ScreenshotParser geminiScreenshotParser(GeminiVisionClient client) {
		return new GeminiScreenshotParser(client);
	}
}
