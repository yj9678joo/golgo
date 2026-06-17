package com.app.golgo.portfolio.parser;

import java.math.BigDecimal;
import java.util.List;

public record ParsedPortfolio(
	List<ParsedHolding> holdings,
	BigDecimal confidence,
	List<String> warnings
) {
	public static ParsedPortfolio sample() {
		return new ParsedPortfolio(
			List.of(new ParsedHolding(
				"005930",
				"삼성전자",
				"KOSPI",
				new BigDecimal("50"),
				new BigDecimal("68000"),
				new BigDecimal("72000"),
				"KRW"
			)),
			new BigDecimal("0.970"),
			List.of("샘플 파싱 결과입니다. 실제 MTS 캡처로 확인해 주세요.")
		);
	}
}
