package com.app.golgo.portfolio.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ScreenshotJobResponse(
	UUID jobId,
	String status,
	String brokerCode,
	String accountNickname,
	Instant parsedAt,
	Instant confirmedAt,
	BigDecimal confidence,
	List<ParsedHoldingResponse> holdings,
	BigDecimal totalAssetKrw,
	List<String> warnings,
	String errorReason,
	String message,
	int estimatedSeconds
) {
}
