package com.app.golgo.broker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ScreenshotBrokerConnectRequest(
	@NotBlank
	@Size(max = 20)
	String brokerCode,
	@Size(max = 50)
	String accountNickname
) {
}
