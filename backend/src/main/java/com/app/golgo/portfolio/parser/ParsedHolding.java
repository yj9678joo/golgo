package com.app.golgo.portfolio.parser;

import java.math.BigDecimal;

public record ParsedHolding(
	String ticker,
	String name,
	String market,
	BigDecimal quantity,
	BigDecimal avgPrice,
	BigDecimal currentPrice,
	String currency
) {
}
