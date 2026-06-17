package com.app.golgo.portfolio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

public record HoldingConfirmRequest(
	@NotEmpty
	List<@Valid HoldingPayload> confirmedHoldings,
	BigDecimal totalAssetKrw
) {
}
