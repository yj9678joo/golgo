package com.app.golgo.portfolio.parser.gemini;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import com.app.golgo.portfolio.parser.ParsedPortfolio;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GeminiScreenshotParserTest {

	private static final Path IMAGE = Path.of("D:/tmp/mstock.png");

	@Mock
	private GeminiVisionClient client;

	@Test
	void mapsGeminiHoldingWithoutRecalculatingDisplayedKrwValue() {
		when(client.parse(IMAGE)).thenReturn(result(holding("005930", "삼성전자", "750000")));
		GeminiScreenshotParser parser = new GeminiScreenshotParser(client);

		ParsedPortfolio parsed = parser.parse(IMAGE);

		assertThat(parsed.holdings()).singleElement().satisfies(holding -> {
			assertThat(holding.ticker()).isEqualTo("005930");
			assertThat(holding.avgPrice()).isEqualByComparingTo("70000");
			assertThat(holding.currentValueKrw()).isEqualByComparingTo("750000");
		});
	}

	@Test
	void addsWarningWhenTickerIsNotVisible() {
		when(client.parse(IMAGE)).thenReturn(result(holding(null, "TIGER 미국S&P500", "6313130")));
		GeminiScreenshotParser parser = new GeminiScreenshotParser(client);

		ParsedPortfolio parsed = parser.parse(IMAGE);

		assertThat(parsed.holdings().getFirst().ticker()).isEmpty();
		assertThat(parsed.warnings()).contains("종목 코드 확인 필요: TIGER 미국S&P500");
	}

	@Test
	void rejectsEmptyGeminiResult() {
		when(client.parse(IMAGE)).thenReturn(new GeminiVisionResult(List.of(), new BigDecimal("0.2"), List.of()));
		GeminiScreenshotParser parser = new GeminiScreenshotParser(client);

		assertThatThrownBy(() -> parser.parse(IMAGE))
			.isInstanceOf(IllegalArgumentException.class)
			.hasMessage("보유 종목을 인식하지 못했습니다.");
	}

	private GeminiVisionResult result(GeminiVisionResult.Holding holding) {
		return new GeminiVisionResult(List.of(holding), new BigDecimal("0.95"), List.of());
	}

	private GeminiVisionResult.Holding holding(String ticker, String name, String currentValueKrw) {
		return new GeminiVisionResult.Holding(
			ticker,
			name,
			"KOSPI",
			new BigDecimal("10"),
			new BigDecimal("70000"),
			new BigDecimal("75000"),
			"KRW",
			new BigDecimal(currentValueKrw)
		);
	}
}
