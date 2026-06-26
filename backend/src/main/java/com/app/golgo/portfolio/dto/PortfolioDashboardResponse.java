package com.app.golgo.portfolio.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record PortfolioDashboardResponse(
	BigDecimal totalAssetKrw,
	BigDecimal totalProfitKrw,
	BigDecimal profitRate,
	List<PortfolioAccountResponse> accounts,
	List<PortfolioHoldingResponse> holdings,
	Instant updatedAt
) {
}
