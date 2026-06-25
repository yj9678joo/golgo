package com.app.golgo.portfolio.dto;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class HoldingPayloadValidationTest {

	private final Validator validator = Validation.buildDefaultValidatorFactory().getValidator();

	@Test
	void allowsBlankTickerForScreenshotHoldingWithoutVisibleCode() {
		HoldingPayload payload = new HoldingPayload(
			"",
			"TIGER 미국S&P500",
			"KRX",
			new BigDecimal("223"),
			new BigDecimal("23063"),
			new BigDecimal("28310"),
			"KRW",
			new BigDecimal("6313130")
		);

		assertThat(validator.validate(payload)).isEmpty();
	}
}
