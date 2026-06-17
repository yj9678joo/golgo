package com.app.golgo.portfolio.dto;

import java.util.UUID;

public record ScreenshotUploadResponse(
	UUID jobId,
	String status,
	int estimatedSeconds
) {
}
