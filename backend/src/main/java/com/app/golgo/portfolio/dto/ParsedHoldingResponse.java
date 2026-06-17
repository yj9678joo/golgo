package com.app.golgo.portfolio.dto;

import java.math.BigDecimal;

public record ParsedHoldingResponse(
	String ticker,
	String name,
	String market,
	BigDecimal quantity,
	BigDecimal avgPrice,
	BigDecimal currentPrice,
	String currency,
	BigDecimal currentValueKrw,
	boolean manuallyEdited
) {
	public static ParsedHoldingResponse from(HoldingPayload payload, boolean manuallyEdited) {
		return new ParsedHoldingResponse(
			payload.ticker(),
			payload.name(),
			payload.market(),
			payload.quantity(),
			payload.avgPrice(),
			payload.currentPrice(),
			payload.currency(),
			payload.quantity().multiply(payload.currentPrice()),
			manuallyEdited
		);
	}
}
