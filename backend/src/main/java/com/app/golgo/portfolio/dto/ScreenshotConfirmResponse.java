package com.app.golgo.portfolio.dto;

import java.time.Instant;
import java.util.UUID;

public record ScreenshotConfirmResponse(
	UUID jobId,
	String status,
	int savedHoldingsCount,
	Instant savedAt
) {
}
