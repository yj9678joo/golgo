package com.app.golgo.broker.controller;

import com.app.golgo.auth.security.JwtPrincipal;
import com.app.golgo.broker.dto.BrokerAccountResponse;
import com.app.golgo.broker.dto.ScreenshotBrokerConnectRequest;
import com.app.golgo.broker.service.BrokerService;
import com.app.golgo.common.api.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/brokers")
public class BrokerController {

	private final BrokerService brokerService;

	public BrokerController(BrokerService brokerService) {
		this.brokerService = brokerService;
	}

	@PostMapping("/connect/screenshot")
	public ApiResponse<BrokerAccountResponse> connectScreenshot(
		@AuthenticationPrincipal JwtPrincipal principal,
		@Valid @RequestBody ScreenshotBrokerConnectRequest request
	) {
		return ApiResponse.ok(brokerService.createScreenshotAccount(principal.userId(), request));
	}

	@GetMapping("/accounts")
	public ApiResponse<List<BrokerAccountResponse>> accounts(@AuthenticationPrincipal JwtPrincipal principal) {
		return ApiResponse.ok(brokerService.accounts(principal.userId()));
	}
}
