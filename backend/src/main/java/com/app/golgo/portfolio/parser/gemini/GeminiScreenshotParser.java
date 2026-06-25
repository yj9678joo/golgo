package com.app.golgo.portfolio.parser.gemini;

import com.app.golgo.portfolio.parser.ParsedHolding;
import com.app.golgo.portfolio.parser.ParsedPortfolio;
import com.app.golgo.portfolio.parser.ScreenshotParser;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class GeminiScreenshotParser implements ScreenshotParser {

	private final GeminiVisionClient client;

	public GeminiScreenshotParser(GeminiVisionClient client) {
		this.client = client;
	}

	@Override
	public ParsedPortfolio parse(Path imagePath) {
		GeminiVisionResult result = client.parse(imagePath);
		if (result.holdings() == null || result.holdings().isEmpty()) {
			throw new IllegalArgumentException("보유 종목을 인식하지 못했습니다.");
		}

		List<String> warnings = new ArrayList<>();
		if (result.warnings() != null) {
			warnings.addAll(result.warnings());
		}

		List<ParsedHolding> holdings = result.holdings().stream()
			.map(holding -> mapHolding(holding, warnings))
			.toList();
		return new ParsedPortfolio(holdings, result.confidence(), List.copyOf(warnings));
	}

	private ParsedHolding mapHolding(GeminiVisionResult.Holding holding, List<String> warnings) {
		String ticker = normalize(holding.ticker());
		String name = normalize(holding.name());
		if (ticker.isEmpty()) {
			warnings.add("종목 코드 확인 필요: " + name);
		}

		return new ParsedHolding(
			ticker,
			name,
			normalize(holding.market()).toUpperCase(),
			holding.quantity(),
			holding.avgPrice(),
			holding.currentPrice(),
			normalize(holding.currency()).toUpperCase(),
			holding.currentValueKrw()
		);
	}

	private String normalize(String value) {
		return value == null ? "" : value.trim();
	}
}
