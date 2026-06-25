package com.app.golgo.portfolio.entity;

import static org.assertj.core.api.Assertions.assertThat;

import com.app.golgo.auth.entity.User;
import com.app.golgo.broker.entity.BrokerAccount;
import com.app.golgo.portfolio.dto.HoldingPayload;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class HoldingTest {

	private static final Clock CLOCK = Clock.fixed(Instant.parse("2026-06-25T00:00:00Z"), ZoneOffset.UTC);

	@Test
	void storesBlankTickerAsNullForScreenshotHoldingWithoutVisibleCode() {
		User user = User.createLocal("golgo01", "hash", "홍길동", "user@example.com", "투자초보", CLOCK);
		BrokerAccount account = BrokerAccount.createScreenshot(user, "MTS", "MTS 캡처 계좌", CLOCK);
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

		Holding holding = Holding.create(account, payload, CLOCK);

		assertThat(holding.getTicker()).isNull();
	}
}
