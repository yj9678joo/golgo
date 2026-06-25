package com.app.golgo.portfolio.parser.gemini;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "golgo.screenshot.gemini")
public record GeminiVisionProperties(
	String apiKey,
	String model,
	String baseUrl
) {
}
