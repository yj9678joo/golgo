package com.app.golgo.portfolio.dto;

import java.math.BigDecimal;
import java.util.List;

public record PortfolioHistoryResponse(
	String period,
	List<Snapshot> snapshots
) {

	public record Snapshot(
		String date,
		BigDecimal totalAssetKrw
	) {
	}
}
