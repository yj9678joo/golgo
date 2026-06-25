package com.app.golgo.portfolio.parser.gemini;

import java.math.BigDecimal;
import java.util.List;

public record GeminiVisionResult(
	List<Holding> holdings,
	BigDecimal confidence,
	List<String> warnings
) {
	public record Holding(
		String ticker,
		String name,
		String market,
		BigDecimal quantity,
		BigDecimal avgPrice,
		BigDecimal currentPrice,
		String currency,
		BigDecimal currentValueKrw
	) {
	}
}
