package com.app.golgo.portfolio.dto;

import com.app.golgo.portfolio.entity.Holding;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

public record PortfolioHoldingResponse(
	String ticker,
	String name,
	String market,
	BigDecimal quantity,
	BigDecimal avgPrice,
	BigDecimal currentPrice,
	BigDecimal currentValueKrw,
	BigDecimal weight,
	BigDecimal profitRate,
	UUID accountId
) {
	private static final int SCALE = 2;

	public static PortfolioHoldingResponse from(Holding holding, BigDecimal totalAssetKrw) {
		return new PortfolioHoldingResponse(
			holding.getTicker(),
			holding.getName(),
			holding.getMarket(),
			holding.getQuantity(),
			holding.getAvgPrice(),
			holding.getCurrentPrice(),
			holding.getCurrentValueKrw(),
			percentage(holding.getCurrentValueKrw(), totalAssetKrw),
			profitRate(holding),
			holding.getBrokerAccount().getId()
		);
	}

	private static BigDecimal profitRate(Holding holding) {
		if (holding.getAvgPrice().signum() <= 0 || holding.getCurrentPrice() == null) {
			return BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP);
		}
		return holding.getCurrentPrice()
			.subtract(holding.getAvgPrice())
			.multiply(new BigDecimal("100"))
			.divide(holding.getAvgPrice(), SCALE, RoundingMode.HALF_UP);
	}

	private static BigDecimal percentage(BigDecimal value, BigDecimal total) {
		if (total.signum() <= 0) {
			return BigDecimal.ZERO.setScale(SCALE, RoundingMode.HALF_UP);
		}
		return value.multiply(new BigDecimal("100")).divide(total, SCALE, RoundingMode.HALF_UP);
	}
}
