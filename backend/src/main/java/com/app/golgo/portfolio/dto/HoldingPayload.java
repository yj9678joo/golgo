package com.app.golgo.portfolio.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record HoldingPayload(
	@NotBlank
	@Size(max = 20)
	String ticker,
	@NotBlank
	@Size(max = 100)
	String name,
	@NotBlank
	@Size(max = 20)
	String market,
	@NotNull
	@DecimalMin(value = "0.0001")
	BigDecimal quantity,
	@NotNull
	@DecimalMin(value = "0.0")
	BigDecimal avgPrice,
	@NotNull
	@DecimalMin(value = "0.0")
	BigDecimal currentPrice,
	@NotBlank
	@Size(min = 3, max = 3)
	String currency
) {
	public HoldingPayload normalized() {
		return new HoldingPayload(
			ticker.trim().toUpperCase(),
			name.trim(),
			market.trim().toUpperCase(),
			quantity,
			avgPrice,
			currentPrice,
			currency.trim().toUpperCase()
		);
	}
}
