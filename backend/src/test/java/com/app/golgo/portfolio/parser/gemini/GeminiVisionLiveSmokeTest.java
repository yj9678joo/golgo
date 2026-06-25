package com.app.golgo.portfolio.parser.gemini;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assumptions.assumeTrue;

import com.app.golgo.portfolio.parser.ParsedHolding;
import com.app.golgo.portfolio.parser.ParsedPortfolio;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.Path;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

@Tag("live")
class GeminiVisionLiveSmokeTest {

	@Test
	void parsesMaskedMstockFixture() {
		String apiKey = System.getenv("GEMINI_API_KEY");
		String imagePath = System.getenv("GEMINI_SMOKE_IMAGE");
		String model = System.getenv().getOrDefault("GEMINI_MODEL", "gemini-2.5-flash");
		assumeTrue(apiKey != null && !apiKey.isBlank() && imagePath != null && !imagePath.isBlank());

		GeminiVisionProperties properties = new GeminiVisionProperties(
			apiKey,
			model,
			"https://generativelanguage.googleapis.com"
		);
		RestClient restClient = RestClient.builder()
			.baseUrl(properties.baseUrl())
			.defaultHeader("x-goog-api-key", apiKey)
			.build();
		GeminiScreenshotParser parser = new GeminiScreenshotParser(
			new GoogleGeminiVisionClient(restClient, new ObjectMapper(), properties)
		);

		ParsedPortfolio result = parser.parse(Path.of(imagePath));

		assertThat(result.holdings()).hasSize(5);
		assertHolding(result, "TIGER 미국우주테크", "180", "14550", "11755", "2115900");
		assertHolding(result, "TIGER 미국나스닥100", "82", "157221", "202930", "16640260");
		assertHolding(result, "TIGER 미국S&P500", "223", "23063", "28310", "6313130");
		assertHolding(result, "ACE KRX금현물", "30", "30923", "29020", "870600");
	}

	private void assertHolding(
		ParsedPortfolio result,
		String name,
		String quantity,
		String avgPrice,
		String currentPrice,
		String currentValueKrw
	) {
		ParsedHolding holding = result.holdings().stream()
			.filter(candidate -> candidate.name().equals(name))
			.findFirst()
			.orElseThrow();
		assertThat(holding.quantity()).isEqualByComparingTo(quantity);
		assertThat(holding.avgPrice()).isEqualByComparingTo(avgPrice);
		assertThat(holding.currentPrice()).isEqualByComparingTo(currentPrice);
		assertThat(holding.currentValueKrw()).isEqualByComparingTo(currentValueKrw);
	}
}
